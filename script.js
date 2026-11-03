
const LOCAL_API_ORIGIN = "http://localhost:5000";
const isLocalPreview = location.protocol === "file:" ||
  (["localhost", "127.0.0.1"].includes(location.hostname) && location.port !== "8888");
const API_URL = `${isLocalPreview ? LOCAL_API_ORIGIN : ""}/api/products`;
const WHATSAPP_NUMBER = "923270127065";

const productList = document.getElementById("product-list");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatPrice(price) {
  return "Rs. " + Number(price).toLocaleString("en-PK");
}

function createProductCard(product) {
  const name = escapeHTML(product.name);
  const category = escapeHTML(product.category);
  const description = escapeHTML(product.description || "Premium quality fabric");
  const image = escapeHTML(product.image || "");
  const price = formatPrice(product.price);
  const stock = Number(product.stock || 0);

  const message = encodeURIComponent(
    `Assalam-o-Alaikum Student Fashion! I want to order:\n\nProduct: ${product.name}\nPrice: ${price}\nCategory: ${product.category}`
  );

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return `
    <article class="product-card">
      <img
        class="product-image"
        src="${image || 'https://placehold.co/600x600/f2f0e9/1d3028?text=Student+Fashion'}"
        alt="${name}"
        loading="lazy"
        onerror="this.src='https://placehold.co/600x600/f2f0e9/1d3028?text=Student+Fashion'"
      >

      <div class="product-info">
        <p class="product-category">${category}</p>
        <h3>${name}</h3>
        <p class="product-description">${description}</p>
        <p class="product-price">${price}</p>
        <p class="stock-text">${stock > 0 ? `Available: ${stock}` : "Please contact us for availability"}</p>

        <a
          class="whatsapp-btn"
          href="${whatsappLink}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Order on WhatsApp
        </a>
      </div>
    </article>
  `;
}

async function loadProducts() {
  productList.innerHTML = '<p class="loading">Loading products...</p>';

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Could not load products.");
    }

    const products = await response.json();

    const menProducts = products.filter(product =>
      String(product.category || "").toLowerCase().includes("men")
    );

    if (menProducts.length === 0) {
      productList.innerHTML = `
        <p class="empty-message">
          No men's products available yet. Please check back soon!
        </p>
      `;
      return;
    }

    productList.innerHTML = menProducts
      .map(createProductCard)
      .join("");

  } catch (error) {
    console.error("Product loading error:", error);

    productList.innerHTML = `
      <p class="error-message">
        Unable to load products. Please make sure the Student Fashion
        backend is running on port 5000.
      </p>
    `;
  }
}

loadProducts();
