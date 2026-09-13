import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, reviews = null, size = 16, showScore = true }) {
  const roundedRating = Math.round(rating * 10) / 10;

  return (
    <div className="star-rating-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D4AF37' }}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = rating >= starIndex;
          const half = !filled && rating >= starIndex - 0.5;

          return (
            <Star
              key={starIndex}
              size={size}
              strokeWidth={1.5}
              fill={filled ? '#D4AF37' : half ? 'url(#half-gold)' : 'none'}
              stroke="#D4AF37"
            />
          );
        })}
      </div>

      {showScore && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a202c', marginLeft: '2px' }}>
          {roundedRating.toFixed(1)}
        </span>
      )}

      {reviews !== null && (
        <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '2px' }}>
          ({reviews.toLocaleString()})
        </span>
      )}
    </div>
  );
}
