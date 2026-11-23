// selling price, original price (crossed out) and discount percentage
export default function PriceTag({ product, big }) {
  const sale = product.salePrice ?? product.price;
  const hasDiscount = product.discount > 0 && sale < product.price;

  return (
    <p className={big ? 'price-tag big' : 'price-tag'}>
      <span className="sale">₹{sale}</span>
      {hasDiscount && (
        <>
          <span className="mrp">₹{product.price}</span>
          <span className="off">({product.discount}% OFF)</span>
        </>
      )}
    </p>
  );
}
