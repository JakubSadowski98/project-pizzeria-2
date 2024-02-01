import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct{ //obsługuje pojedyncze produkty, które znajdują się w koszyku
  constructor(menuProduct, element){ //arg1 - referencja do "productSummary", arg2 - referencja do "generatedDOM"
    const thisCartProduct= this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.price = menuProduct.price;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element){
    const thisCartProduct= this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element; //przypisanie referencji do "generatedDOM"
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
  }

  getData(){ //przygotowuje obiekt posiadający niektóre właściwości instancji "CartProduct" potrzebne do wysłania na serwer
    const thisCartProduct = this;

    const cartProductSummary = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params
    };

    return cartProductSummary;
  }

  initAmountWidget(){
    const thisCartProduct= this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, thisCartProduct.amount); //utworzenie instancji klasy "AmountWidget"; przypisanie do właściwości "amountWidget" referencji do instancji "AmountWidget"

    thisCartProduct.dom.amountWidget.addEventListener('updated', function(event){ //nasłuchiwanie customowego obiekt-eventu 'updated', który informuje instancje "CartProduct" o zmianie wartości w widget
      event.preventDefault();
      thisCartProduct.amount = thisCartProduct.amountWidget.value; //przypisanie aktulnej wartości (czyli liczby sztuk) pobranej z właściwości "value" instancji "AmountWidget"
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

      thisCartProduct.dom.price.innerHTML = thisCartProduct.price; //zaktualizowanie wartości elementu HTML
    });
  }

  delete(){ //usuwa produkt z koszyka
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: { //informacje, które są przekazywane wraz z eventem
        cartProduct: thisCartProduct, //referencja do instancji, dla której kliknięto "remove"
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();

    });

    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.delete();
    });
  }
}

export default CartProduct;