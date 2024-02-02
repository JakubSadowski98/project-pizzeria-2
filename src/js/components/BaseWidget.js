class BaseWidget{ // klasa bazowa - stanowi bazę dla innych klas
  constructor(wrapperElement, initialValue){ // arg1 - referencja do kontenera widgetu; arg2 - początkowa wartość w input
    const thisWidget = this;

    thisWidget.dom = {}; // w obiekcie przechowywane są referencje do elementów DOM
    thisWidget.dom.wrapper = wrapperElement; // przypisanie do właściwości obiektu referencji do kontenera widgetu
    thisWidget.correctValue = initialValue; // przypisanie do właściwości obiektu początkowej wartości w input
  }

  get value() { // (!) tzw. getter; zwraca wartość konkretnego pola obiektu (np. "thisWidget.correctValue"); służy do kontrolowania danch zapisanych w określonym polu; po instrukcji "get" tworzy metodę, która jest wywoływana przez użycie samej nazwy
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value) { // (!) tzw. setter; ustawia wartość konkretnego pola obiektu; po instrukcji "set" tworzy metodę z dokładnie jednym argumentem
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);  // przekonwertowanie argumentu na typ liczbowy, ponieważ input zwraca wartość w formacie tekstowym
    // Add validation (check if argument is not a text, is within a given range, etc.)
    if (thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce(); // wysłanie customowego event-obiektu z informacją o danym zdarzeniu (czyli ustwieniu nowej wartości)
    }
    // Set new valid value in input
    thisWidget.renderValue();
  }

  setValue(value){  // ustwaia wartość w input, ale wcześniej dokonuje walidacji argumentu; (!) dla wywołania metody bez parametru, "value" oznacza wywołanie gettera
      const thisWidget = this;
      thisWidget.value = value; // (!) wywołanie settera z argumentem "value"
  }

  parseValue(value){ // przekonwertowuje argument na typ liczbowy
    return parseInt(value);
  }

  isValid(value){ // (!) może być nadpisana w klasie pochodnej
    return !isNaN(value); // return Number.isNaN(value)
  }

  renderValue(){ // (!) może być nadpisana w klasie pochodnej
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