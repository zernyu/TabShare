window.dojoConfig = {
    locale: 'en-us',
    async: true,
    parseOnLoad: true,
    isDebug: true,
    baseUrl: '/app/js/',
    packages: [
        {
            name: 'dojo',
            location: 'http://ajax.googleapis.com/ajax/libs/dojo/1.7.2/dojo'
        },
        {
            name: 'dijit',
            location: 'http://ajax.googleapis.com/ajax/libs/dojo/1.7.2/dijit'
        },
        {
            name: 'dojox',
            location: 'http://ajax.googleapis.com/ajax/libs/dojo/1.7.2/dojox'
        },
        {
            name: 'tabshare',
            location: 'tabshare'
        }
    ]
};