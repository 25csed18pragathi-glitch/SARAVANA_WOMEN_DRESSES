import { CheckCircle2, Clock, Truck, Package, ShieldCheck, Home } from 'lucide-react';

const STEP_ICONS = [
  ShieldCheck, // Ordered
  CheckCircle2, // Confirmed
  Package, // Packed
  Truck, // Shipped
  Clock, // Out for Delivery
  Home // Delivered
];

export default function OrderTimeline({ timeline = [], currentStep = 0 }) {
  return (
    <div className="order-timeline-wrapper">
      <div className="timeline-track">
        {timeline.map((stepItem, index) => {
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;
          const IconComponent = STEP_ICONS[index] || CheckCircle2;

          return (
            <div
              key={stepItem.step}
              className={`timeline-step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              {/* Timeline Connector Line */}
              {index < timeline.length - 1 && (
                <div
                  className={`timeline-connector ${index < currentStep ? 'filled' : ''}`}
                />
              )}

              {/* Step Circle */}
              <div className="timeline-node">
                <IconComponent size={18} />
              </div>

              {/* Step Info */}
              <div className="timeline-info">
                <span className="timeline-step-name">{stepItem.step}</span>
                <span className="timeline-step-title">{stepItem.title}</span>
                <span className="timeline-step-time">{stepItem.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
