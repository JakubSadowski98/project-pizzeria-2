import { select, classNames, settings, templates } from '../settings.js';
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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    thisBooking.dom.bookingButton =  thisBooking.dom.wrapper.querySelector(select.booking.bookingButton);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
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
    thisBooking.dom.wrapper.addEventListener('updated', function(){ // odznaczenie wybranego stolika przy zmianie godziny, daty, liczby gości oraz liczby godzin
      thisBooking.removeTables();
      thisBooking.updateDOM();
    });
    thisBooking.dom.floorPlan.addEventListener('click', function(event) { // zaznaczenie wybranego stolika przy kliknięciu na dany stolik
      thisBooking.initTables(event);
    });
    thisBooking.dom.bookingButton.addEventListener('click', function(event){ //nasłuchiwanie przycisku "BOOK TABEL"
      event.preventDefault();
      thisBooking.sendBooking();
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
      eventRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventRepeat.join('&'), // localhost:3131/events?repeat_ne=false&date_lte=2024-02-19
    };

    Promise.all([ // pozwala na wywołanie reakcji po zwróceniu wszyskich obietnic zawartych w tablicy
      fetch(urls.booking), // obietnica_1; w momencie wywołania metody fetch() tworzony jest obiekt typu "Promise"
      fetch(urls.eventCurrent), // obietnica_2
      fetch(urls.eventRepeat), // obietnica_3
    ])
      .then(function(allResponses){ // reakcja
        const bookingsResponse = allResponses[0];
        const eventCurrentResponse = allResponses[1];
        const eventRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(), // uzyskanie wartości gotowej do odczytu
          eventCurrentResponse.json(),
          eventRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventCurrent, eventRepeat]){
        thisBooking.parseData(bookings, eventCurrent, eventRepeat);
      });
  }

  parseData(bookings, eventCurrent, eventRepeat) { // agregowanie (gromadzenie) danych dotyczących rezerwacji stolików
    const thisBooking = this;

    thisBooking.booked = {}; // przechowywanie rezerwacji stolików na dany dzień i daną godzinę
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }

    for(let item of eventCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }

    for(let item of eventRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table)
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) { // zapisywanie rezerwacji stolików do obiektu "thisBooking.booked"
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined') { // sprawdzenie czy obiekt jest typu "undefinied"
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = []; // przechowywanie w tablicy numerów stolików, które są zarezerwowane
      }
      thisBooking.booked[date][hourBlock].push(table); // (!)
    }
  }

  updateDOM() { // oznaczenie (wyszarzenie) niedostepnego stolika na mapie restauracji
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value; // wybrana data
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value); // wybrana godzina

    let allAvailable = false;
    // check if table is available for given date and hour
    if(typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }
    // if table is not available add class booked
    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if(!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  removeTables() { // odznaczanie wybranego stolika
    const thisBooking = this;

     for (let table of thisBooking.dom.tables) {
       table.classList.remove(classNames.booking.tableSelected);
     }
   }

  initTables(event){ // zaznaczenie wybranego stolika
    const thisBooking = this;

    thisBooking.removeTables(); // odznaczenie wyboru stolika, przy dokonaniu wyboru innego stolika
    thisBooking.selected = {}; // przechowywanie informacji o wybranym stoliku
    const tableId = event.target.getAttribute('data-table');
    const isBooked = event.target.classList.contains(classNames.booking.tableBooked);
    const isSelected = event.target.classList.contains(classNames.booking.tableSelected);

    if (tableId) {
      if(isBooked) {
          alert('This table is already booked. Chose another table');
      } else if (isSelected) {
          event.target.classList.remove(classNames.booking.tableSelected);
          thisBooking.selected = {};
      } else {
          event.target.classList.add(classNames.booking.tableSelected);
          thisBooking.selected = tableId;
      }
    }
  }

  sendBooking() { // wysłanie rezerwacji na serwer
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;
    const payload = { // obiekt z danymi rezerwacji do wysłania na serwer
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.selected),
      duration: parseInt(thisBooking.hoursAmount.value),
      ppl: parseInt(thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(rawResponse => { // (!) zapis obsługujący wszystkie kody odpowiedzi HTTP, które informują o jakimkolwiek błędzie
        if (rawResponse.status >= 200 && rawResponse.status < 300) {
          return rawResponse.json();
        } else {
          return Promise.reject(rawResponse.status + ' ' + rawResponse.statusText);
        }
      })
      .then(() => {
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table); // dodanie nowej rezerwacji
        alert('The booking was send succesfully');
      })
      .catch((error) => { // metoda wykona przekazaną jej funkcję w przypadku, kiedy nastąpi błąd połączenia
        console.error(error);
        alert('There was a problem with sending Your order. Please try again.');
      });
  }
}

export default Booking;