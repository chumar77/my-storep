/* ===== SETTINGS: change these ===== */
const WHATSAPP = "923011980666";   // country code + number, no + or spaces
const STORE = "SAIS Store";
const CURRENCY = "Rs.";

/* Products: edit name, price, category and image.
   Put each picture in the images/ folder with the same file name. */
const products = [
  {id:1, name:"Product 1", price:2500, cat:"Category 1", img:"images/product-1.jpg"},
  {id:2, name:"Product 2", price:3200, cat:"Category 1", img:"images/product-2.jpg"},
  {id:3, name:"Product 3", price:1800, cat:"Category 2", img:"images/product-3.jpg"},
  {id:4, name:"Product 4", price:4500, cat:"Category 2", img:"images/product-4.jpg"},
  {id:5, name:"Product 5", price:2900, cat:"Category 3", img:"images/product-5.jpg"},
  {id:6, name:"Product 6", price:3600, cat:"Category 3", img:"images/product-6.jpg"},
  {id:7, name:"Product 7", price:2100, cat:"Category 4", img:"images/product-7.jpg"},
  {id:8, name:"Product 8", price:5200, cat:"Category 4", img:"images/product-8.jpg"}
];
/* ================================== */

const $ = id => document.getElementById(id);
const money = n => `${CURRENCY} ${n.toLocaleString("en-US")}`;
const waLink = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

let cart = [];
try { cart = JSON.parse(localStorage.getItem("sais-cart")) || []; } catch(e) { cart = []; }
cart = cart.filter(i => products.some(p => p.id === i.id));
let activeCat = "All";

function save(){ try { localStorage.setItem("sais-cart", JSON.stringify(cart)); } catch(e) {} }

/* ---------- Products ---------- */
function renderFilters(){
  const cats = ["All", ...new Set(products.map(p => p.cat))];
  $("filters").innerHTML = cats.map(c =>
    `<button class="${c === activeCat ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  $("filters").querySelectorAll("button").forEach(b => b.onclick = () => {
    activeCat = b.dataset.cat; renderFilters(); renderProducts();
  });
}

function renderProducts(){
  const list = products.filter(p => activeCat === "All" || p.cat === activeCat);
  $("products").innerHTML = list.map(p => `
    <article class="card">
      <div class="pic">
        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">
        <span hidden>Add image</span>
      </div>
      <h3>${esc(p.name)}</h3>
      <div class="cat-name">${esc(p.cat)}</div>
      <div class="row"><strong>${money(p.price)}</strong><button data-add="${p.id}">Add to cart</button></div>
      <a class="wa" target="_blank" rel="noopener"
         href="${waLink(`Hello ${STORE}, I want to order:\n${p.name} - ${money(p.price)}\nPlease confirm availability.`)}">Order on WhatsApp</a>
    </article>`).join("");
  $("products").querySelectorAll(".pic img").forEach(img => {
    img.addEventListener("error", () => {
      const s = img.parentNode && img.parentNode.querySelector("span");
      if (s) s.hidden = false;
    });
    if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event("error"));
  });
  $("products").querySelectorAll("[data-add]").forEach(b => b.onclick = () => { addToCart(+b.dataset.add); openCart(); });
}

/* ---------- Cart ---------- */
function addToCart(id){
  const it = cart.find(i => i.id === id);
  if (it) it.qty++; else cart.push({id, qty:1});
  save(); renderCart();
}
function changeQty(id, d){
  const it = cart.find(i => i.id === id); if (!it) return;
  it.qty += d;
  if (it.qty <= 0) cart = cart.filter(i => i.id !== id);
  save(); renderCart();
}
function removeItem(id){ cart = cart.filter(i => i.id !== id); save(); renderCart(); }

function cartTotal(){
  return cart.reduce((s, i) => s + products.find(p => p.id === i.id).price * i.qty, 0);
}

function renderCart(){
  $("count").textContent = cart.reduce((s, i) => s + i.qty, 0);
  if (!cart.length){
    $("cartItems").innerHTML = `<p class="empty">Your cart is empty.<br>Add a product to start your order.</p>`;
    $("cartFoot").hidden = true; return;
  }
  $("cartFoot").hidden = false;
  $("cartItems").innerHTML = cart.map(i => {
    const p = products.find(x => x.id === i.id);
    return `<div class="item">
      <div class="thumb"><img src="${esc(p.img)}" alt="" onerror="this.remove()"></div>
      <div><b>${esc(p.name)}</b>${money(p.price)}
        <div class="qty"><button data-m="${p.id}" aria-label="Less">−</button><span>${i.qty}</span><button data-p="${p.id}" aria-label="More">+</button></div>
      </div>
      <button class="rm" data-r="${p.id}">Remove</button>
    </div>`;
  }).join("");
  $("total").textContent = money(cartTotal());
  $("cartItems").querySelectorAll("[data-m]").forEach(b => b.onclick = () => changeQty(+b.dataset.m, -1));
  $("cartItems").querySelectorAll("[data-p]").forEach(b => b.onclick = () => changeQty(+b.dataset.p, 1));
  $("cartItems").querySelectorAll("[data-r]").forEach(b => b.onclick = () => removeItem(+b.dataset.r));
}

function openCart(){ $("drawer").classList.add("open"); $("overlay").classList.add("open"); }
function closeCart(){ $("drawer").classList.remove("open"); $("overlay").classList.remove("open"); }

/* ---------- Checkout -> WhatsApp ---------- */
$("checkout").onclick = () => {
  const name = $("cName").value.trim(), phone = $("cPhone").value.trim(), addr = $("cAddress").value.trim();
  if (!name || !phone || !addr){ $("note").textContent = "Please fill in your name, phone and address."; return; }
  $("note").textContent = "";
  const lines = cart.map((i, n) => {
    const p = products.find(x => x.id === i.id);
    return `${n + 1}. ${p.name} x ${i.qty} = ${money(p.price * i.qty)}`;
  });
  const msg = `New order - ${STORE}\n\n${lines.join("\n")}\n\nTotal: ${money(cartTotal())}\n\nName: ${name}\nPhone: ${phone}\nAddress: ${addr}\nPayment: Cash on delivery`;
  window.open(waLink(msg), "_blank", "noopener");
};

/* ---------- Setup ---------- */
$("openCart").onclick = openCart;
$("closeCart").onclick = closeCart;
$("overlay").onclick = closeCart;
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });
$("contactWa").href = waLink(`Hello ${STORE}, I have a question.`);
$("floatWa").href = waLink(`Hello ${STORE}, I have a question.`);

renderFilters(); renderProducts(); renderCart();
