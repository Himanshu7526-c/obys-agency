const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['survey', 'social_share', 'app_download', 'purchase', 'referral', 'quiz', 'video_watch'],
    required: true
  },
  category: {
    type: String,
    enum: ['engagement', 'marketing', 'education', 'social', 'commerce'],
    required: true
  },
  pointsReward: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 5
  },
  requirements: {
    minLevel: {
      type: Number,
      default: 1
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }]
  },
  instructions: [{
    step: Number,
    description: String,
    image: String
  }],
  validation: {
    type: {
      type: String,
      enum: ['automatic', 'manual', 'code', 'upload'],
      default: 'automatic'
    },
    criteria: String,
    codeRequired: Boolean
  },
  availability: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    maxCompletions: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    currentCompletions: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  partner: {
    name: String,
    logo: String,
    id: String
  },
  externalUrl: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
taskSchema.index({ type: 1, isActive: 1 });
taskSchema.index({ pointsReward: -1 });
taskSchema.index({ featured: -1, createdAt: -1 });
taskSchema.index({ 'requirements.minLevel': 1 });

// Virtual for availability status
taskSchema.virtual('isAvailable').get(function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.availability.startDate > now) return false;
  if (this.availability.endDate && this.availability.endDate < now) return false;
  if (this.availability.maxCompletions > 0 && 
      this.availability.currentCompletions >= this.availability.maxCompletions) {
    return false;
  }
  
  return true;
});

// Method to check if user can complete task
taskSchema.methods.canComplete = function(user) {
  if (!this.isAvailable) return false;
  if (user.level < this.requirements.minLevel) return false;
  
  // Check if user already completed this task
  const alreadyCompleted = user.completedTasks.some(
    task => task.taskId.toString() === this._id.toString()
  );
  
  return !alreadyCompleted;
};

// Method to process completion
taskSchema.methods.processCompletion = function() {
  if (this.availability.maxCompletions > 0) {
    this.availability.currentCompletions++;
  }
  return this.save();
};

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);