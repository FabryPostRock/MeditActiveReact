## UNIT TESTS

-1. Dati delle lezioni — learningContent
Unit test

- ~~Verificare che tutti gli ID delle sezioni siano univoci.~~
- ~~Verificare che ogni sezione contenga titolo, descrizione, video, anteprima e durata di allenamento validi.~~
- ~~Verificare che ogni nextSectionId, quando presente, corrisponda a una sezione esistente.~~
- ~~Verificare che l’ultima sezione abbia nextSectionId uguale a null.~~
- ~~Verificare che exerciseSectionById restituisca la sezione corretta.~~
- ~~Verificare che isSectionId restituisca true per gli ID esistenti.~~
- ~~Verificare che isSectionId restituisca false per stringhe vuote, ID sconosciuti e nomi di proprietà ereditate come toString.~~

2. Redux — trainingProgressSlice
   Stato iniziale

- ~~Verificare che la durata richiesta provenga dai dati della sezione.~~
- ~~Verificare che la prima sezione sia sbloccata e tutte le successive bloccate.~~
- ~~Verificare che video, timer e completamento partano dai valori iniziali previsti.~~
- ~~Verificare che activeSectionId sia inizialmente null.~~

  Aggiornamento del video

- ~~setVideoProgress deve aggiornare posizione corrente, secondi realmente guardati e durata.~~
- ~~L’aggiornamento di una sezione non deve modificare le altre.~~
- ~~setVideoCompleted deve completare il video quando è stato guardato interamente.~~
- ~~Deve accettare lo scarto massimo di un secondo previsto dalla tolleranza.~~
- ~~Non deve completare il video appena sotto la soglia di tolleranza.~~
- ~~Non deve completare video con durata zero o non valida.~~
- ~~Al completamento deve impostare la posizione finale usando la durata arrotondata verso il basso.~~

  Avvio dell’allenamento

- ~~Non deve partire finché il video non è completato.~~
- ~~Il primo avvio deve salvare il timestamp e impostare lo stato running e la sezione come activeSectionId.~~
- ~~Il primo avvio non deve consentire l’avvio di una seconda sezione mentre un’altra è attiva.~~
- ~~Il primo avvio non deve partire da readyToComplete o completed.~~
- ~~Un tentativo di avvio non valido non dovrebbe modificare neppure startedAtMs.~~
- ~~La ripresa dopo una pausa deve usare un nuovo inizio di sessione senza includere nel timer il tempo trascorso in pausa.~~

  Pausa

- ~~Deve funzionare solamente quando lo stato è running.~~
- ~~Deve calcolare correttamente il tempo della sessione.~~
- ~~Deve passare a paused se il tempo richiesto non è stato raggiunto.~~
- ~~Deve passare a readyToComplete se la soglia è stata raggiunta.~~
- ~~Deve liberare activeSectionId.~~
- ~~Una pausa inviata a una sezione non attiva non deve modificare lo stato.~~

  Raggiungimento della durata richiesta

- ~~setReadyToBeCompleted deve essere ignorata se la sezione non è in esecuzione.~~
- ~~Deve essere ignorata se il tempo è inferiore alla durata richiesta.~~
- ~~Deve impostare readyToComplete al raggiungimento della soglia.~~
- ~~Il tempo salvato deve essere limitato esattamente alla durata richiesta.~~
- ~~Deve liberare la sezione attiva.~~
- ~~Dispatch ripetuti non devono produrre ulteriori modifiche.~~

  Completamento e sblocco

- ~~completeTraining deve funzionare soltanto da readyToComplete.~~
- ~~Deve impostare status a completed e trainingCompleted a true.~~
- ~~Deve sbloccare esclusivamente la sezione successiva.~~
- ~~Non deve alterare le sezioni non coinvolte.~~
- ~~Il completamento dell’ultima sezione deve funzionare senza errori.~~
- ~~Un completamento anticipato non deve sbloccare nulla.~~
- ~~Una seconda chiamata sulla stessa sezione deve essere innocua.~~

  Reset

- ~~Il reset deve funzionare solo da readyToComplete o completed.~~
- ~~Deve azzerare tempo e timestamp e riportare lo stato a idle.~~
- ~~Deve stabilire esplicitamente cosa accade a videoCompleted: mantenerlo oppure azzerarlo.~~
- ~~Deve stabilire esplicitamente cosa accade a trainingCompleted: attualmente rimane true, situazione che impedisce correttamente un secondo completamento dalla UI.~~
- ~~Il reset di una sezione non dovrebbe ribloccare quelle già sbloccate.~~

3. Hook del timer — useTrainingTimer
   Unit test

- ~~In stato idle, paused, readyToComplete o completed non deve creare intervalli.~~
- ~~In stato running deve aggiornare immediatamente il tempo.~~
- ~~Deve aggiornare il tempo ogni secondo.~~
- ~~Deve restituire correttamente currentSessionMs e totalElapsedMs.~~
- ~~Il tempo totale non deve superare requiredTrainingMs.~~
- ~~Un eventuale timestamp futuro non deve produrre valori negativi.~~
- ~~Al raggiungimento della durata deve inviare setReadyToBeCompleted.v
- ~~L’azione di completamento temporale deve essere inviata una sola volta.~~
- ~~L’intervallo deve essere rimosso alla pausa, al cambio sezione e allo smontaggio.~~
- ~~Dopo una pausa e una ripresa deve conteggiare solo il tempo effettivamente allenato.~~

## INTEGRATION TESTS

### Navigazione e routing

- ~~Verificare che / carichi l’applicazione senza errori JavaScript.~~
- ~~Verificare che il link “Exercises” apra /exercises.~~
- ~~Verificare che il link “Home” riporti a /.~~
- ~~Verificare che il link della pagina corrente abbia aria-current="page".~~
- ~~Verificare che cliccando sulla prima lezione si apra /exercise/breathing-section-1.~~
- ~~Verificare che una sezione sconosciuta, ad esempio /exercise/unknown, mostri “Pagina Errore”.~~
- ~~Verificare che una rotta inesistente mostri “Pagina Errore”.~~
- ~~Verificare che accedere direttamente a una sezione bloccata mostri la pagina di errore.~~

### Elenco delle lezioni

- ~~Verificare che /exercises mostri il titolo del corso.~~
- ~~Verificare che siano visualizzate tutte e cinque le sezioni.~~
- ~~Verificare che inizialmente solamente la prima sezione sia navigabile da mouse e tastiera.~~

### Pagina della lezione

- ~~Verificare che il video punti al file MP4 previsto e che la risorsa risponda correttamente.~~
- ~~Verificare che i controlli video siano presenti.~~
- ~~Verificare che il training non possa partire prima del completamento del video.~~
- ~~Verificare che la riproduzione completa abiliti l’avvio del training.~~

### Esclusione della riproduzione multipla

Dopo aver predisposto due sezioni sbloccate:

- ~~Aprire due lezioni in due tab dello stesso browser.~~
- ~~Avviare il primo video.~~
- ~~Tentare di avviare il secondo e verificare che il primo continui a essere la sezione attiva.~~
- ~~Verificare che il secondo venga immediatamente messo in pausa.~~
- ~~Mettere in pausa il primo video e verificare che il secondo possa partire.~~
- ~~Chiudere il tab del video attivo e verificare il comportamento previsto per activeSectionId.~~

### Avvio e timer del training

Per questi test Playwright può controllare Date.now(), setInterval e il passaggio del tempo mediante la Clock API, senza attendere realmente cinque secondi. Documentazione Playwright Clock.

- ~~Precaricare una sezione con videoCompleted: true e verificare che il pulsante di avvio sia cliccabile.~~
- ~~Far avanzare il tempo di due secondi e verificare 00:02~~.
- ~~Ricaricare la pagina mentre il training è running e stabilire se il tempo trascorso fuori dalla pagina debba essere contato.~~

### Completamento e sblocco

- ~~Completare progressivamente tutte le sezioni e verificare l’ordine di sblocco.~~
- ~~Completare l’ultima sezione e verificare che l’app non mostri errori.~~
- ~~Verificare che un doppio clic sul pulsante di completamento non produca due transizioni.~~

### Reset

- ~~Dopo il reset di una sezione completata, verificare che non possa essere completata una seconda volta.~~

### Persistenza nel localStorage

- ~~Verificare che una modifica del progresso crei la chiave meditactive-training-progress.~~
- ~~Verificare che il valore salvato sia JSON valido.~~
- ~~Verificare che un reload mantenga video completato, timer, stato e sezioni sbloccate.~~
- ~~Verificare che chiudere e riaprire una pagina nello stesso contesto mantenga il progresso.~~
- ~~Verificare che un nuovo browser context parta dallo stato iniziale.~~
- ~~Inserire JSON non valido nel localStorage e verificare che l’app parta senza errori dallo stato iniziale.~~
- ~~Rimuovere la chiave e verificare il comportamento previsto.~~
- ~~Verificare che un errore di scrittura nel localStorage non renda inutilizzabile l’interfaccia.~~
