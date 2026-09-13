import { ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="global-toast-notification">
      <div className="toast-icon-wrap">
        <CheckCircle size={18} color="#10B981" />
      </div>
      <span className="toast-message-text">{toastMessage}</span>
      <ShoppingBag size={16} color="#9B2242" />
    </div>
  );
}
