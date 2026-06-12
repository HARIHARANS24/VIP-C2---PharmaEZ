import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, cartLoading } = useCart();
  const { isLoggedIn, refreshProfile } = useAuth();

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { toast.error('Please login to add to wishlist'); return; }
    try {
      await api.post(`/auth/wishlist/${product._id}`);
      refreshProfile();
      toast.success('Wishlist updated!');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="product-card card card-hover">
      <div className="product-card-img-wrap">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images?.[0] || `https://placehold.co/300x300/e8f5ee/1a8f4c?text=${encodeURIComponent(product.name.substring(0,10))}`}
            alt={product.name}
            className="product-card-img"
          />
        </Link>
        {hasDiscount && (
          <span className="product-card-discount">{product.discountPercent}% OFF</span>
        )}
        {product.prescriptionRequired && (
          <span className="product-card-rx">Rx</span>
        )}
        <button className="product-card-wishlist" onClick={handleWishlist} title="Add to Wishlist">
          <FiHeart size={16} />
        </button>
      </div>

      <div className="product-card-body">
        <Link to={`/products/${product._id}`}>
          <p className="product-card-category">{product.category}</p>
          <h3 className="product-card-name">{product.name}</h3>
          {product.packSize && <p className="product-card-pack">{product.packSize}</p>}
        </Link>

        <div className="product-card-rating">
          <FiStar size={12} className="star-icon" />
          <span>{product.rating?.toFixed(1) || '0.0'}</span>
          <span className="rating-count">({product.numReviews || 0})</span>
        </div>

        <div className="product-card-price">
          <span className="price-current">₹{price.toFixed(2)}</span>
          {hasDiscount && <span className="price-original">₹{product.price.toFixed(2)}</span>}
        </div>

        {product.stock === 0 ? (
          <button className="btn btn-outline btn-sm w-full" disabled>Out of Stock</button>
        ) : (
          <button
            className="btn btn-primary btn-sm w-full"
            onClick={() => addToCart(product._id)}
            disabled={cartLoading}
          >
            <FiShoppingCart size={14} />
            {product.prescriptionRequired ? 'Add (Rx Required)' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
