require('./init-db')().then(() => {
    // Una vez que la base de datos está inicializada, iniciamos el servidor
    require('./server');
}).catch(error => {
    console.error('Error durante el inicio:', error);
    process.exit(1);
});
