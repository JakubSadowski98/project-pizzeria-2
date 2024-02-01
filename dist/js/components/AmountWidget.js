import { settings, select } from '../settings.js'; // (!) ścieżka do importowanego pliku (../settings.js) jest zawsze relatywna do pliku, w którym się importuje (./components/AmountWidget.js)
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget { // klasa pochodna "AmountWidget" (widget - element interfejsu graficznego) - nadaje życie inputowi i buttonom liczbowym, tak aby informowały o swoim działaniu inne elementy
  constructor(element){ //argumentem jest referencja do kontenera widgetu
    super(element, settings.amountWidget.defaultValue); // wywołanie metody w cely zainicjalizowania konstruktora w klasie nadrzędnej "BaseWidget"
    const thisWidget = this;

    thisWidget.getElements();
    thisWidget.initActions(); //dodanie reakcji na eventy dla input oraz buttonów "+" i "-"
  }

  getElements(){ //metoda służąca odnalezieniu trzech elementów widgetu - inputu i dwóch buttonów
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){ //metoda będzie uruchamiana przy próbie zmiany wartości (w input) i decydować, czy ma na to pozwolić, czy może przywrócić starą (ostatnią dobrą) wartość
    return (!isNaN(value) && value <= settings.amountWidget.defaultMax && value >= settings.amountWidget.defaultMin);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value; //aktualizowanie wartości dla właściwości "value" w input
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
}

export default AmountWidget;