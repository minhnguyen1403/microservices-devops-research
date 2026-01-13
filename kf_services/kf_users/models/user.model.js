
const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const { Schema } = mongoose;
const ModelSchema = new Schema({
    username: { type: String, unique: true },
    password: { type: String },
    full_name: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'modified_at' } });

ModelSchema.pre(['save'], function (next) {
    if (this.code) {
        this.hash = this.code;
    }
    return next();
});
ModelSchema.index({ created_date: -1 });
ModelSchema.index({ created_at: -1 });
ModelSchema.index({ modified_at: -1 });

ModelSchema.plugin(mongooseDelete, {
    deletedAt: true,
    deletedBy: true,
    overrideMethods: true,
});

// ModelSchema.plugin(logPlugin)

const userModel = mongoose.model('userModel', ModelSchema, 'kf_users');

// Hàm kiểm tra xem schema đã được khởi tạo hay chưa
function checkSchemas() {
    console.log('Checking initialized schemas...');
    for (const modelName in mongoose.models) {
        if (mongoose.models.hasOwnProperty(modelName)) {
            console.log(`Model initialized: ${modelName}`);
        }
    }
}

// Gọi hàm kiểm tra
checkSchemas();

module.exports = {
    userModel,
};
