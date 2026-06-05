/* ==========================================
   ENJOY SPOON PREMIUM APP.JS
========================================== */

/* ==========================
   CART
========================== */

let cart =
	JSON.parse(
		localStorage.getItem("cart")
	) || [];

const cartDrawer =
	document.getElementById(
		"cartDrawer"
	);

const cartItems =
	document.getElementById(
		"cart-items"
	);

const cartTotal =
	document.getElementById(
		"cart-total"
	);

const cartCount =
	document.getElementById(
		"cart-count"
	);

const cartOverlay =
	document.createElement(
		"div"
	);

cartOverlay.className =
	"cart-overlay";

cartOverlay.addEventListener(
	"click",
	closeCart
);

if (cartDrawer) {

	document.body.appendChild(
		cartOverlay
	);

}

/* ==========================
   SAVE CART
========================== */

function saveCart() {

	localStorage.setItem(
		"cart",
		JSON.stringify(cart)
	);

}

/* ==========================
   CART DRAWER
========================== */

function toggleCart() {

	if (!cartDrawer) return;

	if (
		cartDrawer.classList.contains(
			"active"
		)
	) {

		closeCart();

	} else {

		openCart();

	}

}

function openCart() {

	if (!cartDrawer) return;

	cartDrawer.classList.add(
		"active"
	);

	cartOverlay.classList.add(
		"active"
	);

	document.body.classList.add(
		"cart-open"
	);

}

function closeCart() {

	if (!cartDrawer) return;

	cartDrawer.classList.remove(
		"active"
	);

	cartOverlay.classList.remove(
		"active"
	);

	document.body.classList.remove(
		"cart-open"
	);

}

/* ==========================
   UPDATE CART COUNT
========================== */

function updateCartCount() {

	let totalItems = 0;

	cart.forEach(item => {

		totalItems += item.quantity;

	});

	cartCount.innerText =
		totalItems;

	/* Bounce Animation */

	cartCount.classList.add(
		"bounce"
	);

	setTimeout(() => {

		cartCount.classList.remove(
			"bounce"
		);

	}, 500);

}

/* ==========================
   ADD TO CART
========================== */

function addToCart(
	name,
	price,
	image = "images/product.png"
) {

	const existing =
		cart.find(
			item => item.name === name
		);

	if (existing) {

		existing.quantity++;

	} else {

		cart.push({

			name,
			price,
			image,
			quantity: 1

		});

	}

	saveCart();

	updateCartCount();

	renderCart();

	openCart();

	showToast(
		`${name} Added To Cart`
	);

}

/* ==========================
   BUY NOW
========================== */

function buyNow(
	name,
	price,
	image = "images/product.png"
) {

	cart = [

		{
			name,
			price,
			image,
			quantity: 1
		}

	];

	saveCart();

	window.location.href =
		"checkout.html";

}

/* ==========================
   REMOVE ITEM
========================== */

function removeFromCart(index) {

	cart.splice(index, 1);

	saveCart();

	renderCart();

	updateCartCount();

	showToast(
		"Item Removed"
	);

}

/* ==========================
   QTY
========================== */

function increaseQty(index) {

	cart[index].quantity++;

	saveCart();

	renderCart();

	updateCartCount();

}

function decreaseQty(index) {

	if (
		cart[index].quantity > 1
	) {

		cart[index].quantity--;

	} else {

		cart.splice(index, 1);

	}

	saveCart();

	renderCart();

	updateCartCount();

}

/* ==========================
   RENDER CART
========================== */

function renderCart() {

	if (!cartItems) return;

	cartItems.innerHTML = "";

	let total = 0;

	if (cart.length === 0) {

		cartItems.innerHTML =

			`
<div class="empty-cart">

<p>
Your cart is empty
</p>

</div>
`;

		cartTotal.innerText = 0;

		return;

	}

	cart.forEach((item, index) => {

		const subtotal =
			item.price *
			item.quantity;

		total += subtotal;

		cartItems.innerHTML +=

			`
<div class="cart-item">

<div class="cart-product">

<img src="${item.image}">

<div class="cart-product-info">

<div class="cart-product-top">

<h4>${item.name}</h4>

<strong>
&#8377;${item.price}
</strong>

</div>

<div class="cart-controls">

<button
onclick="decreaseQty(${index})"
aria-label="Decrease quantity">

-

</button>

<span>
${item.quantity}
</span>

<button
onclick="increaseQty(${index})"
aria-label="Increase quantity">

+

</button>

</div>

</div>

</div>

<div class="cart-bottom">

<strong>
&#8377;${subtotal}
</strong>

<button
class="remove-btn"
onclick="removeFromCart(${index})">

Remove

</button>

</div>

</div>
`;

	});

	cartTotal.innerText =
		total;

}

/* ==========================
   CHECKOUT
========================== */

const checkoutBtn =
	document.querySelector(
		".checkout-btn"
	);

if (checkoutBtn) {

	checkoutBtn.addEventListener(
		"click",
		() => {

			if (cart.length === 0) {

				showToast(
					"Cart Empty"
				);

				return;

			}

			window.location.href =
				"checkout.html";

		}
	);

}

/* ==========================
   TOAST
========================== */

function showToast(message) {

	const toast =
		document.createElement(
			"div"
		);

	toast.className =
		"toast";

	toast.innerText =
		message;

	document.body.appendChild(
		toast
	);

	setTimeout(() => {

		toast.classList.add(
			"show"
		);

	}, 100);

	setTimeout(() => {

		toast.remove();

	}, 3000);

}

/* ==========================
   TESTIMONIAL SLIDER
========================== */

const testimonialSlider =
	document.querySelector(
		".testimonial-slider"
	);

if (testimonialSlider) {

	const testimonialTrack =
		testimonialSlider.querySelector(
			".testimonial-track"
		);

	const testimonialCards =
		Array.from(
			testimonialSlider.querySelectorAll(
				".testimonial-card"
			)
		);

	const prevBtn =
		testimonialSlider.querySelector(
			".testimonial-prev"
		);

	const nextBtn =
		testimonialSlider.querySelector(
			".testimonial-next"
		);

	const dotsWrap =
		testimonialSlider.querySelector(
			".testimonial-dots"
		);

	let testimonialIndex = 0;
	let visibleTestimonials = 3;
	let testimonialTimer;

	function getVisibleTestimonials() {

		if (window.innerWidth <= 640) {
			return 1;
		}

		if (window.innerWidth <= 860) {
			return 2;
		}

		return 3;

	}

	function getMaxTestimonialIndex() {

		return Math.max(
			testimonialCards.length -
				visibleTestimonials,
			0
		);

	}

	function buildTestimonialDots() {

		dotsWrap.innerHTML = "";

		for (
			let i = 0;
			i <= getMaxTestimonialIndex();
			i++
		) {

			const dot =
				document.createElement(
					"button"
				);

			dot.type =
				"button";

			dot.className =
				"testimonial-dot";

			dot.setAttribute(
				"aria-label",
				`Show review ${i + 1}`
			);

			dot.addEventListener(
				"click",
				() => {

					moveTestimonials(i);
					restartTestimonialSlider();

				}
			);

			dotsWrap.appendChild(dot);

		}

	}

	function updateTestimonialDots() {

		const dots =
			dotsWrap.querySelectorAll(
				".testimonial-dot"
			);

		dots.forEach((dot, index) => {

			dot.classList.toggle(
				"active",
				index === testimonialIndex
			);

		});

	}

	function moveTestimonials(index) {

		const maxIndex =
			getMaxTestimonialIndex();

		testimonialIndex =
			index > maxIndex ? 0 :
				index < 0 ? maxIndex :
					index;

		const card =
			testimonialCards[0];

		const gap =
			parseFloat(
				getComputedStyle(
					testimonialTrack
				).gap
			) || 0;

		const offset =
			testimonialIndex *
			(
				card.offsetWidth +
				gap
			);

		testimonialTrack.style.transform =
			`translateX(-${offset}px)`;

		updateTestimonialDots();

	}

	function restartTestimonialSlider() {

		clearInterval(
			testimonialTimer
		);

		testimonialTimer =
			setInterval(() => {

				moveTestimonials(
					testimonialIndex + 1
				);

			}, 4200);

	}

	function setupTestimonialSlider() {

		visibleTestimonials =
			getVisibleTestimonials();

		testimonialIndex =
			Math.min(
				testimonialIndex,
				getMaxTestimonialIndex()
			);

		buildTestimonialDots();
		moveTestimonials(
			testimonialIndex
		);
		restartTestimonialSlider();

	}

	prevBtn.addEventListener(
		"click",
		() => {

			moveTestimonials(
				testimonialIndex - 1
			);
			restartTestimonialSlider();

		}
	);

	nextBtn.addEventListener(
		"click",
		() => {

			moveTestimonials(
				testimonialIndex + 1
			);
			restartTestimonialSlider();

		}
	);

	window.addEventListener(
		"resize",
		setupTestimonialSlider
	);

	setupTestimonialSlider();

}

/* ==========================
   FAQ ACCORDION
========================== */

const faqBtns =
	document.querySelectorAll(
		".faq-btn"
	);

faqBtns.forEach(btn => {

	btn.addEventListener(
		"click",
		() => {

			const parent =
				btn.parentElement;

			parent.classList.toggle(
				"active"
			);

			const content =
				parent.querySelector(
					".faq-content"
				);

			if (
				content.style.display === "block"
			) {

				content.style.display =
					"none";

			} else {

				content.style.display =
					"block";

			}

		}
	);

});

/* ==========================
   SCROLL REVEAL
========================== */

const revealElements =
	document.querySelectorAll(

		".combo-card,\
.feature-card,\
.why-card,\
.testimonial-card,\
.faq-item"

	);

function revealOnScroll() {

	revealElements.forEach(el => {

		const top =
			el.getBoundingClientRect().top;

		if (
			top <
			window.innerHeight - 120
		) {

			el.classList.add(
				"show"
			);

		}

	});

}

window.addEventListener(
	"scroll",
	revealOnScroll
);

revealOnScroll();

/* ==========================
   STICKY HEADER
========================== */

const header =
	document.querySelector(
		".header"
	);

window.addEventListener(
	"scroll",
	() => {

		if (
			window.scrollY > 50
		) {

			header.classList.add(
				"sticky"
			);

		} else {

			header.classList.remove(
				"sticky"
			);

		}

	}
);

/* ==========================
   SMOOTH SCROLL
========================== */

document
	.querySelectorAll(
		'a[href^="#"]'
	)
	.forEach(anchor => {

		anchor.addEventListener(
			"click",
			function(e) {

				e.preventDefault();

				document
					.querySelector(
						this.getAttribute("href")
					)
					.scrollIntoView({

						behavior: "smooth"

					});

			});

	});

/* ==========================
   STICKY MOBILE BUY BAR
========================== */

const mobileBuyBtn =
	document.getElementById(
		"mobileBuyNow"
	);

if (mobileBuyBtn) {

	mobileBuyBtn.addEventListener(
		"click",
		() => {

			window.location.href =
				"#products";

		}
	);

}

/* ==========================
   LOADER
========================== */

window.addEventListener(
	"load",
	() => {

		const loader =
			document.getElementById(
				"loader"
			);

		if (loader) {

			setTimeout(() => {

				loader.style.opacity = 0;

				setTimeout(() => {

					loader.style.display =
						"none";

				}, 400);

			}, 800);

		}

	});

/* ==========================
   INIT
========================== */

updateCartCount();
renderCart();

console.log(
	"Enjoy Spoon Premium Loaded"
);
