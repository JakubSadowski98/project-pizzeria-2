import {select, classNames, templates, settings} from './settings.js';
import utils from './utils.js';
import CartProduct from './components/CartProduct.js';

class Cart{ //obsługuje cały koszyk i wszystkie jego funkcjonalności
  constructor(element){ //argumentem jest referencja do konteneru koszyka
    const thisCart= this;

    thisCart.products = []; //(!) w tablicy przechowywane są produkty (instancje klasy "CartProduct") dodane do koszyka
    thisCart.getElements(element);
    thisCart.initActions();

  }

  getElements(element){ //znajduje elementy znajdujące się w kontenerze koszyka
    const thisCart = this;

    thisCart.dom = {}; //w obiekcie przechowywane są referencje do elementów DOM
    thisCart.dom.wrapper = element; //zapisanie do właściwości referencji do konteneru koszyka (id="cart")

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger); //przypisanie do właściwości referencji do znalezionego elementu "toggleTrigger" w kontenerze koszyka "wrapper"
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList); //(!) referencja do listy zamówionych produktów, wygenerowanej po kliknięciu w "ADD TO CART"
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice); //(!) zapisanie do tablicy referencja do dwóch elementów pokazującychy cenę końcową (total price)
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form); //new
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone); //new
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address); //new
  }

  initActions(){ //rozwija/zwija koszyk
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){ //nasłuchiwanie nagłówka koszyka (elementu o id="cart")
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){ //nasłuchiwanie "productList", w której umieszczone są produkty "CartProduct", w którch jest widget "amountWidget", który generuje event
      thisCart.update(); //ponowne przelicznie kwoty
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.delete(event.detail.cartProduct); //przekazanie jako argument referencji do instancji "thisCartProduct"
    });

    thisCart.dom.form.addEventListener('submit', function(event){ //nasłuchiwanie przycisku "ORDER" w koszyku
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){ //dodaje dane zamawianego produktu do koszyka; argument "menuProduct" zawiera referencję do obiektu "productSummary"
    const thisCart = this;

    /* generate HTML based on template using "templates.cartProduct" */
    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element using "utils.createElementFromHTML" */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    /* add element to cart wrapper using "appendChild" */
    thisCart.dom.productList.appendChild(generatedDOM); //dodanie nowego elementu DOM na koniec kontenera koszyka

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); //utworzenie oraz dodanie instancji klasy "CartProduct" do tablicy
    thisCart.update();
  }

  delete(productToRemove){
    const thisCart = this;
    // check if productToRemove is instance of CartProduct
    if (productToRemove instanceof CartProduct) {
      // remove productToRemove HTML (DOM element)
      productToRemove.dom.wrapper.remove();
      //remove productToRemove reference form thisCart.products array
      const indexOfproductToRemove = thisCart.products.indexOf(productToRemove);
      thisCart.products.splice(indexOfproductToRemove, 1);
      //run update()
      thisCart.update();
    }
  }

  update(){ //przechodzi po wszyskich produktach w koszyku i sumuje kwoty
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0; //całościowa liczba sztuk produktów
    thisCart.subtotalPrice = 0; //zsumowana cena wszystkich produktów

    for(let product of thisCart.products){ //iterowanie po wszystkich produktach w koszyku
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    if(thisCart.totalNumber > 0){ //sprawdzenie, czy zawartość koszyka nie jest pusta
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee; //doliczenie opłaty za wysyłkę i zapisanie jej do właściwości "totalPrice" (mogą z niej korzystać inne metody)
      thisCart.deliveryFee = deliveryFee;

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.totalPrice[0].innerHTML = thisCart.totalPrice;
      thisCart.dom.totalPrice[1].innerHTML = thisCart.totalPrice;
    } else {
      thisCart.totalPrice = thisCart.subtotalPrice;
      thisCart.deliveryFee = 0;

      thisCart.dom.deliveryFee.innerHTML = 0;
      thisCart.dom.totalPrice[0].innerHTML = thisCart.totalPrice;
      thisCart.dom.totalPrice[1].innerHTML = thisCart.totalPrice;
    }

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
  }

  sendOrder(){ //wysyła dane zamówienia na serwer
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders; //adres endpointu

    const payload = { //obiekt z danymi zamówienia do wysłania na serwer (tzw. ładudenk)
      address: thisCart.dom.address.value,
      phone: thisCart.dom.address.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [] //tablica obecnych w koszyku produktów
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = { //opcje konfigurujące request (zapytanie)
      method: 'POST', //metoda służąca do wysylania danych na serwer
      headers: {
        'Content-Type': 'application/json', //poinformowanie serwera o tym, że dane przesyłane są w formie JSON
      },
      body: JSON.stringify(payload), //body - wysyłana treść; przekonwertowanie obiektu "payloud" na postać JSON
    };

    fetch(url, options) //wysłanie zapytania do serwera
      .then(rawResponse => { // (!) zapis obsługujący wszystkie kody odpowiedzi HTTP, które informują o jakimkolwiek błędzie
        if (rawResponse.status >= 200 && rawResponse.status < 300) {
          return rawResponse.json();
        } else {
          return Promise.reject(rawResponse.status + ' ' + rawResponse.statusText);
        }
      })
      .then(parsedResponse => {
        console.log('parsedResponse', parsedResponse);
        alert('The order was send succesfully');
      })
      .catch((error) => { // metoda wykona przekazaną jej funkcję w przypadku, kiedy nastąpi błąd połączenia
        console.error(error);
        alert('There was a problem with sending Your order. Please try again.');
      });
  }
}

export default Cart;