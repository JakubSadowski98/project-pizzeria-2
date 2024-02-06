export const select = {  //(!) referencje do elementów DOM
  templateOf: {
    home:'#template-home',
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product',
    bookingWidget: '#template-booking-widget',
  },
  containerOf: {
    pages: '#pages',
    home:'.home-wrapper',
    carousel: '.main-carousel',
    menu: '#product-list',
    cart: '#cart',
    booking: '.booking-wrapper',
  },
  all: {
    menuProducts: '#product-list > .product',
    menuProductsActive: '#product-list > .product.active',
    formInputs: 'input, select',
  },
  nav: {
    links: '.main-nav a',
  },
  home: {
    homeLinks: '.home-button',
  },
  menuProduct: {
    clickable: '.product__header',
    form: '.product__order',
    priceElem: '.product__total-price .price',
    imageWrapper: '.product__images',
    amountWidget: '.widget-amount',
    cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
    amount: {
      input: 'input.amount',
      linkDecrease: 'a[href="#less"]',
      linkIncrease: 'a[href="#more"]',
    },
    datePicker: {
      wrapper: '.date-picker',
      input: `input[name="date"]`,
    },
    hourPicker: {
      wrapper: '.hour-picker',
      input: 'input[type="range"]',
      output: '.output',
    },
  },
  booking: {
    peopleAmount: '.people-amount',
    hoursAmount: '.hours-amount',
    tables: '.floor-plan .table',
    floorPlan: '.floor-plan',
    bookingButton: '.order-confirmation [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
    starters: '.checkbox label input',
  },
  cart: {
    productList: '.cart__order-summary',
    toggleTrigger: '.cart__summary',
    totalNumber: `.cart__total-number`,
    totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
    subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
    deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
    form: '.cart__order',
    formSubmit: '.cart__order [type="submit"]',
    phone: '[name="phone"]',
    address: '[name="address"]',
  },
  cartProduct: {
    amountWidget: '.widget-amount',
    price: '.cart__product-price',
    edit: '[href="#edit"]',
    remove: '[href="#remove"]',
  },
};

export const classNames = {
  menuProduct: {
    wrapperActive: 'active',
    imageVisible: 'active',
  },
  cart: {
    wrapperActive: 'active',
  },
  booking: {
    loading: 'loading',
    tableBooked: 'booked',
    tableSelected: 'selected',
  },
  nav: {
    active: 'active',
  },
  pages: {
    active: 'active',
  },
};

export const settings = {
  amountWidget: {
    defaultValue: 1,
    defaultMin: 1,
    defaultMax: 9,
  },
  cart: {
    defaultDeliveryFee: 20,
  },
  hours: {
    open: 12,
    close: 24,
  },
  datePicker: {
    maxDaysInFuture: 14,
  },
  booking: {
    tableIdAttribute: 'data-table',
  },
  db: { // konfguracja parametrów, które są potrzebne do połączenia się z API
    url: '//' + window.location.hostname + (window.location.hostname=='localhost' ? ':3131' : ''), // aplikacja klienta sama decyduje, w jaki sposób połączyć się z serwerem API
    products: 'products', // link do kolekcji /products
    orders: 'orders', // link do kolekcji /orders
    bookings: 'bookings', // link do kolekcji /bookings
    events: 'events', // link do kolekcji /events
    dateStartParamKey: 'date_gte',
    dateEndParamKey: 'date_lte',
    notRepeatParam: 'repeat=false',
    repeatParam: 'repeat_ne=false',
  },
};

export const templates = { //metody obiektu "templates" (np. "home") są tworzone za pomocą biblioteki "Handlebars"
  home: Handlebars.compile(document.querySelector(select.templateOf.home).innerHTML),
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML),
};