import BaseWidget from '../components/BaseWidget.js';
import { utils } from '../utils.js';
import { select, settings } from '../settings.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date())); // arg1 - referencja do kontenera widgetu; arg2 - aktualna data w formacie tekstowym
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input); // referencja do inputu, na którym będzie działać plugin "flatpickr"
    thisWidget.initPlugin(); // uruchomienie pluginu
  }

  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(); // aktualna data
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture); // data przesunięta o daną liczbę dni
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, { //flatpickr(element, options) - wywołanie funkcji, która przyjmuje dwa argumenty: arg1 - referencja inputu, na którym plugin ma się uruchomić, arg2 - obiekt zawierający opcje pluginu
      defaultDate: thisWidget.minDate, // aktualna data
      minDate: thisWidget.minDate, //  minimalna data do wybrania - nie można wybrać terminu wcześniejszego
      maxDate: thisWidget.maxDate, // maksymalna data do wybrania - nie można wybrać terminu późniejszego
      locale: {
        firstDayOfWeek: 1 // pierwszym dniem tygodnia jest poniedziałek
      },
      disable: [
        function(date) {
          return (date.getDay() === 2); // wtorek jest niedostępny przy wyborze dnia
        }
      ],
      onChange: function(selectedDates, dateStr) { // uruchomienie funkcji callback, gdy plugin wykryje zmianę terminu
        thisWidget.value = dateStr; // zaaktualizowanie terminu poprzez uruchomienie settera
      },
    });
  }

  parseValue(value){ // wyłączenie lub nadpisanie oryginalnych metod z "BaseWidget"
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){
    // set empty declaration to turn off method
  }
}

export default DatePicker;
