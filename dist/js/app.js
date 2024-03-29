import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = { //obiekt, który pomaga w organizacji kodu aplikacji; jego rolą jest tworzenie nowych instancji i ich wykorzystywanie
  initPages: function(){ //obsługuje podstrony (wyszukuje referencje do podstron i dodaje nasłuchiwacze do linków)
    const thisApp = this; // (!) "this" wskazuje na obiekt "app"

    thisApp.pages = document.querySelector(select.containerOf.pages).children; //referencja do podstron (dzieci elementu id="pages")
    thisApp.navLinks = document.querySelectorAll(select.nav.links); //referencja kolekcji do linków ".main-nav a" do przełączania podstron

    const idFromHash = window.location.hash.replace('#/', ''); // właściwośc "window.location.hash" zawiera id podstrony, która jest aktualnie włączona (np. "#/order")
    let pageMatchingHash = thisApp.pages[0].id; // id podstrony, która ma być włączona dla pierwszego załadowania aplikacji
    // check if pageMatchingHash has right page id
    for (let page of thisApp.pages){
      if(page.id === idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    thisApp.avctivatePage(pageMatchingHash); // włączenie podstrony o danym id dla pierwszego załadowania aplikacji

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        event.preventDefault();
        const clickedElement = this; // (!) "this" wskazuje na kliknięty link
        /*get page id from href attribute*/
        const id = clickedElement.getAttribute('href').replace('#', '');
        /*run thisApp.activatePage with that id*/
        thisApp.avctivatePage(id);
        /*change url hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  avctivatePage: function(pageId){ // aktywuje (włącza) podstronę o danym id
    const thisApp = this;

    /*add class active to matching pages, remove from non-matching */
    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId); // lub if(age.id == pageId)
    }

    /*add class active to matching links, remove from non-matching */
    for(let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '# '+ pageId);
    }
  },

  initData: function(){ //metoda, która pobiera dane z obiektu "dataSource" komunikując się z serwerem API
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products; //adres endpointu, pod którym serwer API udostępnia dane (listę produktów)

    fetch(url) //(!) wysłanie zapytania (request) do serwera API pod podany adres endpointu
      .then(function(rawResponse){ //funkcja schowana w metodzie "then" jest uruchamiana wtedy, gdy request się zakończy, a serwer API zwróci odpowiedź
        return rawResponse.json(); //surowa opdowiedź (rawresponse), w formacie JSON, jest konwertowana na obiekt JS-owy
      })
      .then(function(parsedResponse){ //skonwertowana odpowiedź (parsedResponse) wyświetlana jest w konsoli
        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse; //pobrane dane z serwera zapisywane są da do właściwości obieku "app", zatem będą one dostępne w całym obiekcie (również dla pozostałych metod tego obiektu)
        // execute initMenu method
        thisApp.initMenu(); //uruchowmienie metody następuje po otrzymaniu danych (listy produktów) z serwera
      });
  },

  initMenu: function(){ //metoda, która pośredniczy w tworzeniu instancji wg szablonu klasy "Product", korzystajac z pobranych danych przez "initData"
    const thisApp = this;

    for(let productData in thisApp.data.products){ //pętla przechodzi po właściwościach (a konkretnie po kluczach "productData") obiektu "products", czyli cake, breakfast, itd.
      //new Product(productData, thisApp.data.products[productData]); //instancję klasy tworzymy za pomocą słowa kluczowego new, nazwy klasy, oraz argumentów przekazywanych do konstruktora klasy (czyli klucz właściwości oraz wartość właściwości)
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initHome: function (){
    const thisApp = this;

    thisApp.homeContainer = document.querySelector(select.containerOf.home);
    thisApp.homeLinks = document.querySelectorAll(select.home.homeLinks);
    thisApp.home = new Home(thisApp.homeContainer);

    for (let homeLink of thisApp.homeLinks) {
      homeLink.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();
        /* get page id from href attibute*/
        const linkId = clickedElement.getAttribute('href').replace(/#/g, '');
        /* run thisApp.activatePage with that id*/
        thisApp.avctivatePage(linkId);
        /* Change URL hash*/
        window.location.hash = '#/' + linkId;
      });
    }
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart); //wyszukuje kontener koszyka (id="cart")
    thisApp.cart = new Cart(cartElem); //referencja do instancji "Cart" jest zapisana do "thisApp.cart"

    thisApp.productList = document.querySelector(select.containerOf.menu);
      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
  },

  initBooking: function(){
    const thisApp = this;

    const widgetBookingContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(widgetBookingContainer);
    },

  init: function(){ //metoda, która będzie uruchamiać wszystkie pozostałe komponenty strony, za pośrednictwem innych metod z obiektu "app"
    const thisApp = this;

    thisApp.initPages();
    thisApp.initData();
    thisApp.initHome();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init(); //(!) załadowanie strony/aplikacji