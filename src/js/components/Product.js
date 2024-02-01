import { select, classNames, settings, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{ //klasa, która stanowi szablon dla tworzonych instancji-produktu
  constructor(id, data){ //metoda "constructor" inicjuje nową instancje (object) i zwraca ją; przy okazji dodaje do instancji właściwości oraz wywołuje dla niej metody
    const thisProduct = this; //(!) referencja do instancji

    thisProduct.id = id; //e.g. cake - dodanie właściwości do instancji
    thisProduct.data = data; //e.g. {class: 'small', name: "Zio Stefano's Doughnut", price: 9, etc.}

    thisProduct.renderInMenu(); //wywołanie metody po utworzeniu instancji
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initAmountWidget();
    thisProduct.initOrderForm();
    thisProduct.processOrder()
  }

  renderInMenu(){ //(!) metoda, która będzie renderować – czyli tworzyć – nasze produkty na stronie (elementy DOM)
    const thisProduct = this;

    // create dom object storing references to DOM elements
    thisProduct.dom = {}; //w obiekcie przechowywane są referencje do elementów DOM
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data); //wstawianie kodu HTML do szablonu HANDLEBARS
    /* create element using utils.createElementFromHTML */
    thisProduct.dom.element = utils.createDOMFromHTML(generatedHTML); //(!) stworzony element DOM zapisywany jest do właściwości instancji "Product", dzięki temu będzie dostęp do niego również w innych metodach instancji
    /* find menu container (element div with class container) */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.dom.element); //metada "appendChild" wstawia nowy element-dziecko na koniec wybranego elementu-rodzica
  }

  getElements(){ //metoda służąca odnalezieniu elementów DOM; przypisuje referencje do elementów znajdujących się w kontenerze "element"
    const thisProduct = this;

    thisProduct.dom.accordionTrigger = thisProduct.dom.element.querySelector(select.menuProduct.clickable); //zapisanie we właściwościach instancji referencji do elementów w kontenerze produktu, aby móc z nich korzystać w innych metodach; (!) danej referencji szukamy w kontenerze pojedynczego produktu ("thisProduct.dom.element") a nie w całym dokumencie ("document")
    thisProduct.dom.form = thisProduct.dom.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.dom.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.dom.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.dom.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.dom.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){ //rozwija/zwija część elementu
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    //const clickableTrigger = thisProduct.dom.element.querySelector(select.menuProduct.clickable); //szukamy trigerra w (!) nowo utworzonym elemencie-produkcie

    /* START: add event listener to clickable trigger on event click */
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event){ //podajemy anonimową (nienazwaną) funkcję jako drugi argument metody - referencja do funkcji callback
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('.product.active');
      /* if there is active product and it's not thisProduct.dom.element, remove class active from it */
      if (activeProduct != null && activeProduct != thisProduct.dom.element){ //sprawdzenie czy aktywny produkt nie jest tym, który został kliknięty
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive); //zwija produkt, usuwając klasę "active"
      }
      /* toggle active class on thisProduct.dom.element */
      thisProduct.dom.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm(){ //metoda odpowiedzialna za dodanie event listenerów do formularza, jego kontrolek, oraz guzika dodania do koszyka
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function(event){
      event.preventDefault(); //blokujemy domyślną akcję – wysłanie formularza z przeładowaniem strony (klawisz "enter") - to pozwoli obliczyć cenę produktu bez przeładowania strony
      thisProduct.processOrder();
    });

    for(let input of thisProduct.dom.formInputs){ //kontrolki formularza zawarte w elementach input i select
      input.addEventListener('change', function(){ //jeśli zaznaczono opcje to uruchamia funkcję callback
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function(event){ //button "ADD TO CART"
      event.preventDefault(); //blokujemy domyślną akcję – zmianę adresu strony po kliknięciu w link "Add to card"
      thisProduct.processOrder();
      thisProduct.addToCart(); //uruchamia metodę, która przekazuje referencję do obiektu "productSummary" jako argument metody "add()" klasy "Cart"
    });
  }

  initAmountWidget(){ //metoda odpowiedzialna za utworzenie nowej instancji klasy "AmountWidget"
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem, settings.amountWidget.defaultValue); //utworzenie instancji klasy "AmountWidget"; przypisanie do właściwości instancji "Product" referencji do instancji "AmountWidget"

    thisProduct.dom.amountWidgetElem.addEventListener('updated', function(event){ //nasłuchiwanie customowego obiekt-eventu 'updated', który informuje instancje "Product" o zmianie wartości w widget
      event.preventDefault();
      thisProduct.processOrder(); //wywołanie metody, która przeliczy cenę, gdy się dowie o zmianie ilości sztuk
    });
  }

  processOrder(){ //metoda obliczająca cenę produktu za każdym razem od nowa; dodatkowo obsługuje pojawiwanie się grafiki z uwzględnieniem zaznaczonych opcji
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form); //dostęp do formularza w formie obiektu, który zawiera zaznaczone opcje (np. olives) parametru (np. toppings) dla produktu

    // set price to default price
    let price = thisProduct.data.price; //domyślna cena produktu

    // for every category (param)...
    for(let paramId in thisProduct.data.params) { //e.g. paramId = 'toppings' - pętla "for..in" w zmiennej iteracyjnej zwraca zawsze tylko nazwę właściwości
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "paramId"

      // for every option in this category
      for(let optionId in param.options) { //e.g. optionId = 'olives'
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "optionId", e.g. olives: {label, price, default}
        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)){ //sprawdzenie, czy zaznaczono opcje - czy obiekt "optionId" jest zawarty w obiekcie "paramId"
          // check if the option is not default
          if(option.default != true){  //uwaga: jeśli obiekt nie ma właściwości "default", to wyrażenie jest prawdzie, ponieważ "undefined" nie jest równe "true"
          // add option price to price variable
          price += option.price;
          }
        } else {
          // check if the option is default
          if(option.default == true) {
          // reduce price variable
          price -= option.price;
          }
        }
        // find image fitted to param-option pair e.g. sauce-tomato
        const optionImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`); // (!) lub ('.' + paramId + '-' + optionId)
        // check if image was found
        if(optionImage){
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)){
            // add class active to optionImage
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            // remove class active from optionImage
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    // update calculated price (amount = 1) in the JS
    thisProduct.priceSingle = price;
    // multiply price by amount
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }

  addToCart(){ //przesyła dane zamawianego produktu
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct()); //wywołanie metody "add()" z referencją do obiektu "productSummary"
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.dom.element.dispatchEvent(event);
  }

  prepareCartProduct(){ //zapisuje dane zamawianego produktu
    const thisProduct = this;

    const productSummary = {}; //obiekt, który posiada niezbędne dane dla koszyka
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.name = thisProduct.data.name;
    productSummary.priceSingle = thisProduct.priceSingle; //cena jednostkowa
    productSummary.params = thisProduct.prepareCartProductParams(); //zawiera kategorie (e.g. "toppings") i opcje (e.g. "olives") zamówionego produktu
    productSummary.id = thisProduct.id;
    productSummary.price = productSummary.priceSingle * productSummary.amount; //cena całkowita

    return productSummary;
  }

  prepareCartProductParams(){ //przygotowuje obiekt podsumujący wybrane opcje zamówionego produktu
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form); //dostęp do formularza w formie obiektu, który zawiera zaznaczone opcje
    const params = {}; //zawiera kategorie (e.g. "toppings") i opcje (e.g. "olives") zamówionego produktu
    // for every category (param)...
    for(let paramId in thisProduct.data.params) { //e.g. paramId = 'toppings' - pętla "for..in" w zmiennej iteracyjnej zwraca zawsze tylko nazwę właściwości
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "paramId", e.g. toppings: {label: 'Toppings', type: 'checkboxes', options: {}}
      // create category "paramId" in "params" const eg. params = { toppings: { label: 'Toppings', options: {}}}
      params[paramId] = { //(!) po każdej iteracji pętli zewnętrznej dodawany jest obiekt "paramId" do obiektu "params"
        label: param.label,
        options: {}
      }
      // for every option in this category
      for(let optionId in param.options) { //e.g. optionId = 'olives'
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId]; //zapewnia dostęp do całego obiektu dostępnego pod właściwością "optionId", e.g. olives: {label, price, default}
        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)){ //sprawdzenie, czy zaznaczono opcje - czy właściwość "optionId" jest zawarta w obiekcie "paramId"
          // create option "optionId" in "options" object
          params[paramId].options[optionId] = option.label; //(!) po każdej iteracji pętli wewnętrznej dodawana jest właściwosć "optionId" do obiektu "options"
        }
      }
    }
    return params;
  }
}

export default Product;