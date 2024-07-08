const TEMPLATE_IMPORT_DATA = [
    'employee_code',
    'branch_name_abbreviate',
    'status'
]

const LIST_PERMISSION = [
    'revenue-review',
    "saleorder.picked",
    "transferitem.confirm",
    "transferitem.received",
    "paymenttransaction.write",
    "paymenttransaction.read",
    "trackingbatchnumber.manage",
    "damageitem.cancel",
    "stocktake.complete",
    "damageitem.confirm",
    "stocktake.confirm",
    "stocktake.create",
    "stocktake.save",
    "damageitem.save",
    "purchasereceipt.complete",
    "exchange-receipt.complete",
    "return-receipt.complete",
    "order-request.create",
    "return-request.create",
];

const EMPLOYEE_STORE_MANAGE = 'employee-store.manage';
const KF_USERS = 'kf_users';
module.exports = {
    TEMPLATE_IMPORT_DATA,
    LIST_PERMISSION,
    EMPLOYEE_STORE_MANAGE,
    KF_USERS,
}