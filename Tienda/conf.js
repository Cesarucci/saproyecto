config = {
  "nombre": "tienda1.compania.com",
  "pais": "Alemania",
  "nodo": "nodoeuropa.grupo5.com",
  "bodegas":
  [
      {"destino":"localhost:3006","pais":"Mexico","nodo":"nodoamerica.grupo3.com"},
      {"destino":"localhost:3009","pais":"Espana","nodo":"nodoeuropa.grupo5.com"},
  ],
  "client_id": "client_id de oAuth2",
  "client_secret": "client_secret de oAuth2"
}
module.exports = config;
