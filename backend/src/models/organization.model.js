import mongoose from "mongoose"
const { Schema, model } = mongoose


const OrganizationSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true, required: true },
        adminUserId: { type: Schema.Types.ObjectId, ref: "OrgUser", required: true },
    },
    { timestamps: true, versionKey: false }
);

// Optional lookups
OrganizationSchema.index({ email: 1 });
OrganizationSchema.index({ adminUserId: 1 });


export const OrganizationModel = model("organization", OrganizationSchema);