import { select, settings, templates } from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking { // pobiera przefiltrowane dane z API
  constructor(element)  {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.getElement();
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(); // dane nie są przekazywane, gdyż ten szablon nie oczekuje na żaden placeholder
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
  }

  getElement() {
    const thisBooking = this;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount, settings.amountWidget.defaultValue);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, settings.amountWidget.defaultValue);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker, settings.hours.open);

    thisBooking.dom.peopleAmount.addEventListener('updated', function(event){
      event.preventDefault();
      // further instruction
    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function(event){
      event.preventDefault();
      // further instruction
    });
  }

  getData() { // pobiera przefiltrowane dane z serwera API (aby dokonać wyboru dostępnego stolika, uwzględniając datę i godzinę, skrypt musi najpierw wiedzieć, kiedy poszczególne stoliki są zajęte)
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = { // adresy do endpointów
      booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'), // localhost:3131/bookings?date_gte=2024-02-05&date_lte=2024-02-19
      eventCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventCurrent.join('&'), // localhost:3131/events?repeat=false&date_gte=2024-02-05&date_lte=2024-02-19
      eventRepeat:  settings.db.url + '/' + settings.db.events + '?' + params.eventRepeat.join('&'), // localhost:3131/events?repeat_ne=false&date_lte=2024-02-19
    };

    Promise.all([ // pozwala na wywołanie reakcji po zwróceniu wszyskich obietnic zawartych w tablicy
      fetch(urls.booking), // obietnica_1; w momencie wykorzystania metody fetch() tworzony jest obiekt typu "Promise"
      fetch(urls.eventCurrent), // obietnica_2
      fetch(urls.eventRepeat), // obietnica_3
    ])
      .then(function(allResponses){ // reakcja
        const bookingsResponse = allResponses[0];
        const eventCurrentResponse = allResponses[1];
        const eventRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventCurrentResponse.json(),
          eventRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventCurrent, eventRepeat]){
        console.log('bookings', bookings);
        console.log('eventsCurrent', eventCurrent);
        console.log('eventsRepeat', eventRepeat);
      });
  }
}

export default Booking;