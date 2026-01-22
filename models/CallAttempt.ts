import { Schema, model, models } from "mongoose";

const CallAttemptSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    attemptNumber: Number,
    status: {
      type: String,
      enum: ["initiated", "answered", "no_answer", "failed"],
      default: "initiated"
    },
    note: String
  },
  { timestamps: true }
);

export default models.CallAttempt ||
  model("CallAttempt", CallAttemptSchema);