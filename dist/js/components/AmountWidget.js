import { settings, select } from '../settings.js';

class AmountWidget{ //widget (element interfejsu graficznego) wyboru ilości produktów - jego rolą jest nadanie życia inputowi i buttonom liczbowym, tak aby informowały o swoim działaniu inne elementy
  constructor(element,  value){ //argumentem jest referencja do widgetu zmiany ilości
    const thisWidget = this;

    thisWidget.getElements(element); //przekazanie argumentu "element" dalej, jako argument kolejnej metody
    thisWidget.setValue(value); //wywołanie metody, która ustawi domyślną wartość inputu (czyli "settings.amountWidget.defaultValue" lub "thisCartProduct.amount")
    thisWidget.initActions(); //dodanie reakcji na eventy dla input oraz buttonów "+" i "-", czyli zmiana ilości produktu
  }

  getElements(element){ //metoda służąca odnalezieniu trzech elementów widgetu - inputu i dwóch buttonów
    const thisWidget = this;

    thisWidget.dom = {}; //w obiekcie przechowywane są referencje do elementów DOM
    thisWidget.dom.element = element; //przypisanie do właściwości instancji "AmountWidget" referencji do kontenera widgetu
    thisWidget.dom.input = thisWidget.dom.element.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){ //metoda będzie uruchamiana przy próbie zmiany wartości (w input) i decydować, czy ma na to pozwolić, czy może przywrócić starą (ostatnią dobrą) wartość
    const thisWidget = this;

    const newValue = parseInt(value); //przekonwertowanie przekazanego argumentu na liczbę, ponieważ input zwraca wartość w formacie tekstowym
    /* Add validation */
    if(thisWidget.value !== newValue && !isNaN(newValue)) { //sprawdza, czy wartość, która jest już aktualnie w "thisWidget.value" jest inna niż wartość, która przychodzi do funkcji "newValue" oraz czy "newValue" nie jest tekstem; operator "!==" oznacza różne wartości i typy danych
      if(newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue; //ustawienie wartości ilości sztuk produktu
      }
    }

    thisWidget.dom.input.value = thisWidget.value; //aktualizowanie wartości dla właściwości "value" w input

    thisWidget.announce(); //wywołanie metody, która wysyła customowy event-obiekt z informacją o ustawieniu wartości
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce(){ //metoda, która tworzy instancje (obiekt-event) klasy "Event" wbudowanej w przeglądarkę - dzięki temu "AmountWidget" będzie informował inne elementy (np. instancje "Product") o zmianie ilości
    const thisWidget = this;

    const event = new CustomEvent('updated', { //"update" to nazwa customowego eventu
      bubbles: true // włączenie właściwości "bubbles": obiekt-event bąbelkuje (emituje) w górę po wszystkich elementach (a nie tylko po elemencie na, którym jest odpalany)
    });

    thisWidget.dom.element.dispatchEvent(event); //metoda "dispatchEvent", odpalana na "thisWidget.dom.element," wysyła obiekt-event do "event listenera" z informacją o ustawieniu wartości w widget
  }
}

export default AmountWidget;