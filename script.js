

const products = [
  { id: 1, name: "Classic T-Shirt", price: 1500 },
  { id: 2, name: "Stylish Hoodie", price: 3000 },
  { id: 3, name: "Everyday Bag", price: 2000 }
];

const cart = [];

const productsDiv = document.getElementById("products");
const cartDiv = document.getElementById("cart");

products.forEach(product => {
  const card = document.createElement("div");
  card.className = "product";

  card.innerHTML = `
    <h3>${product.name}</h3>
    <p>Price: PKR ${product.price.toLocaleString()}</p>
    <button>Add to Cart</button>
  `;

  card.querySelector("button").addEventListener("click", () => {
    cart.push(product);
    renderCart();
  });

  productsDiv.appendChild(card);
});

function renderCart() {
  if (cart.length === 0) {
    cartDiv.textContent = "Your cart is empty";
    return;
  }

  cartDiv.replaceChildren();

  cart.forEach((item, index) => {
    const row = document.createElement("p");
    row.textContent = `${item.name} - PKR ${item.price.toLocaleString()} `;

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
      cart.splice(index, 1);
      renderCart();
    });

    row.appendChild(removeButton);
    cartDiv.appendChild(row);
  });

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const totalRow = document.createElement("h3");
  totalRow.textContent = `Total: PKR ${total.toLocaleString()}`;
  cartDiv.appendChild(totalRow);
}
