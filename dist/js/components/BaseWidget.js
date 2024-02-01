class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {}; // w obiekcie przechowywane są referencje do elementów DOM
    thisWidget.dom.wrapper = wrapperElement; // referencja do kontenera widgetu
    thisWidget.correctValue = initialValue; // ustawienie pierwotnej wartości w input
  }

  get value() { // (!) zwraca wartość konkretnego pola ("thisWidget.correctValue"); służy do kontrolowania danch zapisanych w określonym polu; po instrukcji "get" tworzy metodę
    const thisWidget = this;

    return thisWidget.correctValue;
  }
  // console.log(thisWidget.value);
  set value(value) { // (!) ustawia wartość konkretnego pola (argument "value" jest wartością pola "thisWidget.correctValue"); po instrukcji "set" tworzy metodę z dokładnie jednym parametrem
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);
    /* Add validation */
    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce(); // wysłanie customowego event-obiektu z informacją o o danym zdarzeniu
    }

    thisWidget.renderValue();
  }
  // thisWidget.value = 0;
  setValue(value){
      const thisWidget = this;

      thisWidget.value = value;
  }

  parseValue(value){ // przekonwertowuje przekazany argumentu na liczbę, ponieważ input zwraca wartość w formacie tekstowym
    return parseInt(value);
  }

  isValid(value){ // sprawdza czy przekazany argument nie jest tekstem
    return !isNaN(value); // return Number.isNaN(value)
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){ // tworzy obiekt-event - dzięki temu "BaseWidget" będzie informował inne elementy (np. instancje "Product") o danym zdarzeniu
    const thisWidget = this;

    const event = new CustomEvent('updated', { // "CustomEvent" to klasa wbudowana w przęglądarkę; "update" to nazwa customowego eventu
      bubbles: true // włączenie właściwości "bubbles": obiekt-event bąbelkuje (emituje) w górę po wszystkich elementach (a nie tylko po elemencie na, którym jest odpalany)
    });

    thisWidget.dom.wrapper.dispatchEvent(event); //metoda "dispatchEvent", odpalana na "thisWidget.dom.wrapper," wysyła obiekt-event do "event listenera" z informacją o danym zdarzeniu
  }
}

export default BaseWidget;