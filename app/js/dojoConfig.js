window.dojoConfig = {
  locale: 'en-us',
  async: true,
  parseOnLoad: true,
  isDebug: true,
  baseUrl: '/app/js/',
  packages: [
    {
      name: 'dojo',
      location: 'http://ajax.googleapis.com/ajax/libs/dojo/1.7.1/dojo'
    },
    {
      name: 'dijit',
      location: 'http://ajax.googleapis.com/ajax/libs/dojo/1.7.1/dijit'
    },
    {
      name: 'tabshare',
      location: 'tabshare'
    }
  ]
}
