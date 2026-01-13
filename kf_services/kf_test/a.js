async integrityStocktakeAuditReport(req, res, next) {
    const spanId = this.span.context().spanIdStr;
    try {
        const { duration = -1 } = req.body;
        const start_date = moment().tz('Asia/Ho_chi_minh').subtract('days', duration).startOf('day').utc();
        const end_date = moment().tz('Asia/Ho_chi_minh').subtract('days', duration).endOf('day').utc();
        const dataAuditReports = await handleGetListAuditReports({ body: { start_date, end_date }, spanId });
        const clickhouseAuditReports = await getExistedAuditDaily()({ period_date: start_date.valueOf() });
        const chAuditReportObj = _.keyBy(clickhouseAuditReports, (item) => `${item.branch_id}-${item.period_date}-${item.product_group}`);
        const missingData = [];
        const diffData = [];
        for (const item of dataAuditReports) {
            const { branch_id, period_date, product_group, revenues, diff_value, support_fund, total_confirm, total_sku, } = item;
            const key = `${branch_id}-${period_date}-${product_group}`;
            const existedCH = chAuditReportObj[key];
            if (!existedCH) {
                missingData.push({ ...item, key, is_missing: true });
                continue;
            }
            const { revenues: exRevenues, diff_value: exDiffValues, support_fund: exSupportFund, total_confirm: exTotalConfirm, total_sku: exTotalSku, } = existedCH;
            if (_.xor([revenues, diff_value, support_fund, total_confirm, total_sku], [exRevenues, exDiffValues, exSupportFund, exTotalConfirm, exTotalSku]).length > 0) {
                diffData.push({ ...item, key });
            }
        }
        const diffArray = [...missingData, ...diffData];
        const realErrorRows = await findActualDiff({
            cacheProvider: this.cacheProvider,
            cacheKey: 'kf-data-histogram-integrity-stocktake-audit-reports',
            newDiff: diffArray,
            unique_key: 'key',
        });
        const diffLength = realErrorRows.length;
        let response;
        if (diffLength != 0) {
            const filepath = generatePathFile(StocktakeConstant.INTEGRITY_AUDIT_FILENAME, StocktakeConstant.INTEGRITY_EXT);
            fs.writeFileSync(filepath, JSON.stringify(realErrorRows), null, 2);
            const missingLength = _.filter(realErrorRows, (item) => item.is_missing).length;
            response = {
                caption:
                    `So sánh stocktake-audit-reports on clickhouse
                    - Tổng số line thiếu CH: ${missingLength}  lines.
                    - Tổng số line bị chênh lệch: ${diffLength - missingLength} lines.
                `,
                filepath, chat_id: IntegrityConstant.chat_id,
            };
            await request(sdk.TeleMessage.sendWithAttachment(response));
            fs.unlinkSync(filepath);
        }

        return res.sendItem(response);
    } catch (error) {
        return next(error);
    }
}

async integrityStocktakeLines(req, res, next) {
    try {
        const { duration = 0 } = req.body;
        const modified_at_from = moment().tz(Constants.HCM_TIMEZONE).subtract(duration, 'days').startOf('day').utc();
        let cond = { modified_at: { $gte: convertStringToDate(modified_at_from) } };
        let countDocuments = 0;
        const limit = 500;
        const diffLines = [];
        const diffConfirmedLines = [];
        const countTotalLines = await StockTakeLineMongoModel.countDocuments(cond);
        do {
            const mongoStocktakeLines = await StockTakeLineMongoModel.find(cond).select('_id total_revenue status').limit(limit).sort({ _id: 1 }).lean();
            countDocuments = mongoStocktakeLines.length;
            if (countDocuments > 0) {
                /** check all line */
                const mongoLineIds = mongoStocktakeLines.map((item) => item._id.toString());
                const clickhouseLines = await getExistedStocktakeLines()({ ids: mongoLineIds, selects: 'id, total_revenue, status' });
                diffLines.push(..._.xor(mongoLineIds, clickhouseLines.map((item) => item.id.toString())).map((id) => ({ id })));
                /** check confirmed line */
                const confirmedStatus = StocktakeConstant.STOCKTAKE_LINE_STATUS.CONFIRMED;
                const confirmedMongoLines = mongoStocktakeLines.filter((item) => item.status == confirmedStatus).map((item) => `${item._id}-${(_.toNumber(item.total_revenue) || 0).toFixed(3)}`);
                const confirmedCHLines = clickhouseLines.filter((item) => item.status == confirmedStatus).map((item) => `${item.id}-${(_.toNumber(item.total_revenue) || 0).toFixed(3)}`);
                diffConfirmedLines.push(
                    ..._.difference(confirmedMongoLines, confirmedCHLines).map((item) => {
                        const [lineId, totalRevenue] = item.split('-');
                        return {
                            id: lineId,
                            total_revenue: parseFloat(totalRevenue),
                        };
                    })
                );
                cond = _.merge(cond, { _id: { $gt: _.get(_.last(mongoStocktakeLines), '_id') } });
            }
        } while (countDocuments == limit);
        const diffArray = [...diffLines, ...diffConfirmedLines];
        const realErrorRows = await findActualDiff({
            cacheProvider: this.cacheProvider,
            cacheKey: 'kf-data-histogram-integrity-stocktake-lines',
            newDiff: diffArray,
            unique_key: 'id',
        });
        let response;
        const errorLength = realErrorRows.length;
        if (errorLength > 0) {
            const filepath = generatePathFile(StocktakeConstant.INTEGRITY_FILENAME, StocktakeConstant.INTEGRITY_EXT);
            fs.writeFileSync(filepath, JSON.stringify([...diffLines, ...diffConfirmedLines]), null, 2);
            const missingLinesLength = _.filter(realErrorRows, (item) => !item.total_revenue);
            const diffConfirmedLineLength = errorLength - missingLinesLength;
            response = {
                caption:
                    `So sánh stocktake-lines, chiều MONGO -> CH
                    - Tổng số line từ ${modified_at_from.tz(Constants.HCM_TIMEZONE).format('DD/MM/YYYY')}: ${countTotalLines} lines.
                    - Tổng số line thiếu ở CH: ${missingLinesLength}  lines.
                    - Tổng số line hoàn thành lệch doanh thu: ${diffConfirmedLineLength} lines.
                `,
                filepath, chat_id: IntegrityConstant.chat_id,
            };
            await request(sdk.TeleMessage.sendWithAttachment(response));
            fs.unlinkSync(filepath);
        }
        return res.sendItem(response);
    } catch (err) {
        console.log(err);
        return next(err);
    }
}