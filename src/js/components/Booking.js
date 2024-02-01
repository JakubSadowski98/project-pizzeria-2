import { select, settings, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element)  {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.getElement();
    thisBooking.initWidgets();
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
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountt = new AmountWidget(thisBooking.dom.peopleAmount, settings.amountWidget.defaultValue);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount, settings.amountWidget.defaultValue);

    thisBooking.dom.peopleAmount.addEventListener('updated', function(event){
      event.preventDefault();

    });
    thisBooking.dom.hoursAmount.addEventListener('updated', function(event){
      event.preventDefault();
      
    });
  }
}

export default Booking;