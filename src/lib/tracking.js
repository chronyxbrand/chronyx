export const trackViewItem = (product) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'INR',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: 1
        }
      ]
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: 'INR'
    });
  }

  if (typeof window.klaviyo !== 'undefined' && window.klaviyo.push) {
    window.klaviyo.push(['track', 'Viewed Product', {
      ProductName: product.name,
      ProductID: product.id,
      Price: product.price
    }]);
  }
};

export const trackAddToCart = (product, quantity = 1) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'INR',
      value: product.price * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: quantity
        }
      ]
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * quantity,
      currency: 'INR'
    });
  }

  if (typeof window.klaviyo !== 'undefined' && window.klaviyo.push) {
    window.klaviyo.push(['track', 'Added to Cart', {
      ProductName: product.name,
      ProductID: product.id,
      Price: product.price,
      Quantity: quantity,
      ItemTotal: product.price * quantity
    }]);
  }
};

export const trackBeginCheckout = (cartItems, totalValue) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: totalValue,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      value: totalValue,
      currency: 'INR',
      num_items: cartItems.reduce((acc, item) => acc + item.quantity, 0)
    });
  }

  if (typeof window.klaviyo !== 'undefined' && window.klaviyo.push) {
    window.klaviyo.push(['track', 'Started Checkout', {
      TotalValue: totalValue,
      ItemNames: cartItems.map(item => item.name),
      Items: cartItems.map(item => ({
        ProductID: item.id,
        ProductName: item.name,
        Quantity: item.quantity,
        ItemPrice: item.price
      }))
    }]);
  }
};

export const trackPurchase = (orderId, cartItems, totalValue) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: totalValue,
      currency: 'INR',
      items: cartItems.map(item => ({
        item_id: item.product_id || item.id,
        item_name: item.product_name || item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      value: totalValue,
      currency: 'INR',
      content_ids: cartItems.map(item => item.product_id || item.id),
      content_type: 'product'
    });
  }
};
