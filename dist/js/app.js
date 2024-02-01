import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = { //obiekt, który pomaga w organizacji kodu aplikacji; jego rolą jest tworzenie nowych instancji i ich wykorzystywanie
  initMenu: function(){ //metoda, która pośredniczy w tworzeniu instancji wg szablonu klasy "Product", korzystajac z pobranych danych przez "initData"
    const thisApp = this;

    for(let productData in thisApp.data.products){ //pętla przechodzi po właściwościach (a konkretnie po kluczach "productData") obiektu "products", czyli cake, breakfast, itd.
      //new Product(productData, thisApp.data.products[productData]); //instancję klasy tworzymy za pomocą słowa kluczowego new, nazwy klasy, oraz argumentów przekazywanych do konstruktora klasy (czyli klucz właściwości oraz wartość właściwości)
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
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

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart); //wyszukuje kontener koszyka (id="cart")
    thisApp.cart = new Cart(cartElem); //referencja do instancji "Cart" jest zapisana do "thisApp.cart"

    thisApp.productList = document.querySelector(select.containerOf.menu);
      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
  },

  init: function(){ //metoda, która będzie uruchamiać wszystkie pozostałe komponenty strony, za pośrednictwem innych metod z obiektu "app"
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
  },
};

app.init(); //załadowanie strony/aplikacji