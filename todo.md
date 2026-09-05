1. Dati delle lezioni — learningContent
   Unit test

- Verificare che tutti gli ID delle sezioni siano univoci.
- Verificare che ogni sezione contenga titolo, descrizione, video, anteprima e durata di allenamento validi.
- Verificare che ogni nextSectionId, quando presente, corrisponda a una sezione esistente.
- Verificare che l’ultima sezione abbia nextSectionId uguale a null.
- Verificare che exerciseSectionById restituisca la sezione corretta.
- Verificare che isSectionId restituisca true per gli ID esistenti.
- Verificare che isSectionId restituisca false per stringhe vuote, ID sconosciuti e nomi di proprietà ereditate come toString.

2. Redux — trainingProgressSlice
   Stato iniziale

- Verificare che esista un progresso per ogni sezione.
- Verificare che la durata richiesta provenga dai dati della sezione.
- Verificare che la prima sezione sia sbloccata e tutte le successive bloccate.
- Verificare che video, timer e completamento partano dai valori iniziali previsti.
- Verificare che activeSectionId sia inizialmente null.

  Aggiornamento del video

- setVideoProgress deve aggiornare posizione corrente, secondi realmente guardati e durata.
- L’aggiornamento di una sezione non deve modificare le altre.
- setVideoCompleted deve completare il video quando è stato guardato interamente.
- Deve accettare lo scarto massimo di un secondo previsto dalla tolleranza.
- Non deve completare il video appena sotto la soglia di tolleranza.
- Non deve completare video con durata zero o non valida.
- Al completamento deve impostare la posizione finale usando la durata arrotondata verso il basso.

  Avvio dell’allenamento

- Non deve partire finché il video non è completato.
- Il primo avvio deve salvare il timestamp e impostare lo stato running.
- Deve impostare la sezione come activeSectionId.
- Non deve consentire l’avvio di una seconda sezione mentre un’altra è attiva.
- Non deve partire da readyToComplete o completed.
- Un tentativo di avvio non valido non dovrebbe modificare neppure startedAtMs.
- La ripresa dopo una pausa deve usare un nuovo inizio di sessione senza includere nel timer il tempo trascorso in pausa.

  Pausa

- Deve funzionare solamente quando lo stato è running.
- Deve calcolare correttamente il tempo della sessione.
- Dopo più pause e riprese deve sommare le sessioni senza duplicare il tempo.
- Deve passare a paused se il tempo richiesto non è stato raggiunto.
- Deve passare a readyToComplete se la soglia è stata raggiunta.
- Deve liberare activeSectionId.
- Una pausa inviata a una sezione non attiva non deve modificare lo stato.

  Raggiungimento della durata richiesta

- setReadyToBeCompleted deve essere ignorata se la sezione non è in esecuzione.
- Deve essere ignorata se il tempo è inferiore alla durata richiesta.
- Deve impostare readyToComplete al raggiungimento della soglia.
- Il tempo salvato deve essere limitato esattamente alla durata richiesta.
- Deve liberare la sezione attiva.
- Dispatch ripetuti non devono produrre ulteriori modifiche.
  Completamento e sblocco
- completeTraining deve funzionare soltanto da readyToComplete.
- Deve impostare status a completed e trainingCompleted a true.
- Deve sbloccare esclusivamente la sezione successiva.
- Non deve alterare le sezioni non coinvolte.
- Il completamento dell’ultima sezione deve funzionare senza errori.
- Un completamento anticipato non deve sbloccare nulla.
- Una seconda chiamata sulla stessa sezione deve essere innocua.

  Reset

- Il reset deve funzionare solo da readyToComplete o completed.
- Deve azzerare tempo e timestamp e riportare lo stato a idle.
- Deve stabilire esplicitamente cosa accade a videoCompleted: mantenerlo oppure azzerarlo.
- Deve stabilire esplicitamente cosa accade a trainingCompleted: attualmente rimane true, situazione che può impedire un secondo completamento dalla UI.
- Il reset di una sezione non dovrebbe ribloccare quelle già sbloccate.

3. Hook del timer — useTrainingTimer
   Unit test

- In stato idle, paused, readyToComplete o completed non deve creare intervalli.
- In stato running deve aggiornare immediatamente il tempo.
- Deve aggiornare il tempo ogni secondo.
- Deve restituire correttamente currentSessionMs e totalElapsedMs.
- Il tempo totale non deve superare requiredTrainingMs.
- Un eventuale timestamp futuro non deve produrre valori negativi.
- Al raggiungimento della durata deve inviare setReadyToBeCompleted.
- L’azione di completamento temporale deve essere inviata una sola volta.
- L’intervallo deve essere rimosso alla pausa, al cambio sezione e allo smontaggio.
- Dopo una pausa e una ripresa deve conteggiare solo il tempo effettivamente allenato.

4. Componenti semplici — Title e Article
   Unit test

- Title deve mostrare il titolo ricevuto.
- Article deve mostrare titolo, anteprima, stato e stato del video.
- L’immagine deve avere src e testo alternativo corretti.
- Se il video non è completato deve mostrare “da vedere”.
- Se il video è completato deve mostrare “completato”.
- Una card bloccata deve avere inert, aria-disabled, opacità ridotta e interazioni disattivate.
- Una card sbloccata non deve contenere attributi di disabilitazione.

5. Card della lezione — ExerciseCard
   Test d’integrazione

- Deve leggere dal Redux store il progresso della sezione corretta.
- Una sezione sbloccata deve essere racchiusa in un link verso /exercise/:sectionId.
- Il link deve avere un nome accessibile contenente il titolo della lezione.
- Una sezione bloccata non deve avere un link navigabile.
- Lo stato e il completamento video mostrati devono aggiornarsi quando cambia Redux.
- Il completamento della lezione precedente deve trasformare la card successiva da bloccata a navigabile.

6. Vista della singola lezione — ExerciseView
   Unit test del rendering

- Deve mostrare titolo, descrizione e video corretti.
- Il video deve avere controlli e nome accessibile.
- Deve mostrare stato, completamento video e timer formattato.
- Verificare la formattazione a 00:00, sotto il secondo, a 60 secondi e oltre il minuto.
- Una sezione bloccata deve mostrare la pagina di errore e non il video.

  Integrazione video–Redux

- timeupdate deve inviare un aggiornamento solamente quando cambia l’intervallo di due secondi.
- Eventi ripetuti nello stesso intervallo non devono produrre dispatch duplicati.
- Il payload deve contenere posizione corrente, durata e somma degli intervalli realmente riprodotti.
- Lo spostamento avanti nel video non deve essere considerato automaticamente tempo guardato.
- Lo spostamento indietro non deve duplicare i secondi già guardati.
- L’evento ended deve completare il video solamente se gli intervalli riprodotti coprono quasi tutta la durata.
- Cambiando lezione senza smontare il componente, il primo aggiornamento del nuovo video non deve essere ignorato dal riferimento all’intervallo precedente.

  Integrazione pulsanti–Redux

- Prima del completamento video, il pulsante play deve essere realmente non utilizzabile.
- Il primo click valido deve avviare l’allenamento con il timestamp corrente.
- Durante l’esecuzione deve mostrare pausa e inviare l’azione corretta.
- Dopo una pausa deve mostrare nuovamente play e riprendere il conteggio.
- Il reset deve essere disponibile solamente da readyToComplete o completed.
- Il pulsante di completamento deve essere disponibile solamente da readyToComplete.
- I pulsanti indicati come disabilitati non devono inviare azioni tramite mouse o tastiera.
- Ogni pulsante dovrebbe avere un nome accessibile comprensibile, non dipendente dal testo tecnico dell’icona.

7. Pagina elenco — Exercises

   Test d’integrazione

- Deve mostrare il titolo del corso.
- Deve renderizzare una card per ogni sezione.
- Le card devono rispettare l’ordine definito nei dati.
- All’avvio soltanto la prima card deve essere navigabile.
- Il completamento progressivo deve rendere navigabile una card alla volta.

8. Pagina esercizio — Exercise

   Test d’integrazione

- Un ID valido deve mostrare la lezione corrispondente.
- Un ID inesistente deve mostrare la pagina di errore.
- Un parametro mancante deve mostrare la pagina di errore.
- Una sezione valida ma ancora bloccata deve mostrare l’errore.
- La navigazione da una sezione valida a un URL non valido non deve causare errori React.
- La navigazione tra due sezioni valide deve aggiornare video, titolo e stato Redux corretti.
  Quest’ultimo gruppo è importante perché il componente chiama attualmente useAppSelector solo nel ramo con parametro valido: un test di navigazione può evidenziare una variazione nell’ordine degli hook.

9. Routing, App e navbar
   Test d’integrazione

- / deve mostrare Home.
- /exercises deve mostrare l’elenco delle lezioni.
- /exercise/:sectionId deve mostrare la lezione richiesta.
- Un percorso sconosciuto deve mostrare la pagina di errore.
- La navbar deve essere presente su tutte le pagine.
- Logo e nome del sito devono portare alla Home.
- I link Home ed Exercises devono navigare correttamente.
- Il link attivo deve ricevere classe active e aria-current="page".
- Il link Home non deve risultare attivo sulle rotte figlie per errore.

10. Flussi completi
    Test d’integrazione/E2E

- Guardare completamente il primo video, avviare il timer, attendere la soglia, completare l’esercizio e verificare lo sblocco della seconda lezione.
- Mettere in pausa e riprendere più volte, verificando che il tempo in pausa non venga conteggiato.
- Provare ad avviare una seconda lezione mentre la prima è attiva e verificare il blocco.
- Provare ad aprire direttamente tramite URL una lezione bloccata.
- Completare in sequenza tutte le lezioni fino all’ultima.
- Resettare una lezione completata e verificare che possa essere svolta e completata nuovamente.
- Navigare nell’app durante un allenamento e verificare il comportamento scelto per il timer.
- Ricaricare la pagina e verificare il comportamento atteso: attualmente lo stato Redux in memoria viene perso.
- Eseguire il flusso tramite tastiera, controllando focus, link e pulsanti.
- Verificare il layout desktop e mobile: navbar, contenuti non sovrapposti, video adattato al viewport e assenza di scorrimento orizzontale.
