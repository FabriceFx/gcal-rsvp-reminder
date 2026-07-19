/**
 * ============================================================================
 * SCRIPT DE RAPPEL AUTOMATIQUE GOOGLE AGENDA
 * ============================================================================
 * 
 * Description : 
 * Ce script parcourt les événements de la journée en cours dans Google Agenda. 
 * Pour chaque événement dont vous êtes le propriétaire, il identifie les invités 
 * n'ayant pas encore répondu à l'invitation (statut 'INVITED'). Il leur envoie 
 * ensuite un e-mail de rappel automatique contenant un lien direct pour indiquer 
 * leur présence ou absence.
 * 
 * 
 * Fonctions :
 * - rappels() : Fonction principale qui vérifie les événements et envoie les mails.
 * - ajoutTrigger() : Fonction utilitaire à exécuter une seule fois manuellement 
 *   pour installer le déclencheur automatique (exécution quotidienne à 8h01).
 * 
 * Développeur : Fabrice FAUCHEUX
 * ============================================================================
 */

/**
 * Configuration globale du script
 */
const CONFIG = {
  TEMPLATE_FILE: 'email',
  TRIGGER_HOUR: 8,
  TRIGGER_MINUTE: 1,
  FUNCTION_NAME: 'rappels',
  SENDER_NAME: '', // Laissez vide pour utiliser par défaut le nom du compte/calendrier
  LANGUE: 'fr' // Forcez la langue ici ('fr' ou 'en') car la détection automatique échoue souvent en tâche de fond
};

/**
 * Envoie des rappels par e-mail aux invités n'ayant pas encore répondu aux événements du jour.
 */
const rappels = () => {
  try {
    const aujourdHui = new Date();
    const calendrierParDefaut = CalendarApp.getDefaultCalendar();
    const evenements = calendrierParDefaut.getEventsForDay(aujourdHui);

    const fuseauHoraireScript = Session.getScriptTimeZone();
    const emailUtilisateurActuel = Session.getEffectiveUser().getEmail();

    // Utilisation de la langue forcée dans la configuration (la détection automatique en arrière-plan renvoie souvent 'en')
    const langue = CONFIG.LANGUE || 'fr';

    // Textes pour l'e-mail (Code)
    const textes = {
      fr: {
        sujet: (titre, heureDebut) => `Rappel pour ${titre} | ⏰ ${heureDebut}`,
        secours: "Veuillez activer l'affichage HTML pour voir ce message.",
        salutation: "Bonjour,",
        messageNonRepondu_1: "Vous n'avez pas encore répondu à la demande de rendez-vous",
        messageNonRepondu_2: "prévue pour aujourd'hui.",
        demandePresence: "Merci de nous indiquer si vous serez présent(e) en cliquant sur le bouton ci-dessous :",
        boutonRSVP: "Indiquer ma présence",
        salutationFin: "Cordialement,",
        footerInfo: "Mail envoyé automatiquement via un script de"
      },
      en: {
        sujet: (titre, heureDebut) => `Reminder: ${titre} | ⏰ ${heureDebut}`,
        secours: "Please enable HTML view to see this message.",
        salutation: "Hello,",
        messageNonRepondu_1: "You have not yet responded to the meeting request",
        messageNonRepondu_2: "scheduled for today.",
        demandePresence: "Please let us know if you will be attending by clicking the button below:",
        boutonRSVP: "RSVP",
        salutationFin: "Best regards,",
        footerInfo: "Email sent automatically via a script by"
      }
    };

    const nomExpediteur = CONFIG.SENDER_NAME || calendrierParDefaut.getName();
    
    // Vérification initiale du quota
    let quotaRestant = MailApp.getRemainingDailyQuota();
    if (quotaRestant <= 0) {
      console.warn("Quota d'envoi d'e-mails épuisé pour aujourd'hui. Fin de l'exécution.");
      return;
    }

    // Préparation du template HTML (optimisation : chargé une seule fois)
    const modeleHtml = HtmlService.createTemplateFromFile(CONFIG.TEMPLATE_FILE);

    for (const evenement of evenements) {
      // Ignorer les événements dont on n'est pas le propriétaire
      if (!evenement.isOwnedByMe()) continue;
      
      // Ignorer les événements dont l'heure de début est déjà passée
      if (evenement.getStartTime() < aujourdHui) continue;

      const invites = evenement.getGuestList(false);
      // Filtrer uniquement les invités n'ayant pas répondu
      const invitesEnAttente = invites.filter(invite => invite.getGuestStatus() === CalendarApp.GuestStatus.INVITED);

      if (invitesEnAttente.length === 0) continue;

      // Extraction des données communes à l'événement
      const titre = evenement.getTitle();
      const description = evenement.getDescription();
      const idEvenement = evenement.getId().split('@')[0];
      
      // Formatage de l'heure selon la langue (ex: 14h30 en FR, 02:30 PM en EN)
      let heureDebutFormat = '';
      if (langue === 'fr') {
        heureDebutFormat = Utilities.formatDate(evenement.getStartTime(), fuseauHoraireScript, 'HH:mm').replace(':', 'h');
      } else {
        heureDebutFormat = Utilities.formatDate(evenement.getStartTime(), fuseauHoraireScript, 'hh:mm a');
      }

      const sujet = textes[langue].sujet(titre, heureDebutFormat);

      for (const invite of invitesEnAttente) {
        // Vérification du quota avant envoi
        if (quotaRestant <= 0) {
          console.warn(`Quota d'envoi d'e-mails épuisé en cours d'exécution (événement: "${titre}").`);
          return; // Arrêt complet pour éviter les erreurs MailApp en cascade
        }

        try {
          const email = invite.getEmail();

          // Création de l'ID compatible avec les URL de Google Agenda 
          const idEncode = Utilities.base64EncodeWebSafe(`${idEvenement} ${email}`).replace(/=/g, '');

          // Utilisation de l'URL moderne Google Agenda
          const lienReunion = `https://calendar.google.com/calendar/event?action=VIEW&eid=${idEncode}`;

          // Injection des données et génération du HTML
          modeleHtml.langue = langue;
          modeleHtml.traductions = textes[langue];
          modeleHtml.titre = titre;
          modeleHtml.description = description;
          modeleHtml.lienReunion = lienReunion;
          const corpsHtml = modeleHtml.evaluate().getContent();

          // Envoi de l'email avec le nom récupéré dynamiquement
          GmailApp.sendEmail(email, sujet, textes[langue].secours, {
            name: nomExpediteur,
            cc: emailUtilisateurActuel,
            htmlBody: corpsHtml
          });

          quotaRestant--; // Décrémenter le quota localement après succès
        } catch (erreurEmail) {
          console.error(`Erreur lors de l'envoi du rappel pour un événement (${idEvenement}) : ${erreurEmail.message}`);
        }
      }
    }
  } catch (erreur) {
    console.error(`Erreur critique globale lors de l'exécution du script : ${erreur.message}`);
    // Notification active par email à l'administrateur
    try {
      const emailAlerte = Session.getEffectiveUser().getEmail();
      MailApp.sendEmail({
        to: emailAlerte,
        subject: "⚠️ Erreur critique : Script Rappel Google Agenda",
        body: `Une erreur est survenue lors de l'exécution de vos relances RSVP :\n\n${erreur.message}\n\nVérifiez l'éditeur Apps Script pour plus de détails.`
      });
    } catch (e) {
      // Échec silencieux si plus de quota pour alerter
    }
  }
};

/**
 * Crée un déclencheur quotidien pour exécuter la fonction de rappels à 8h01.
 * Supprime les anciens déclencheurs pour éviter les envois en double.
 */
const ajoutTrigger = () => {
  // Nettoyage des anciens triggers
  const declencheurs = ScriptApp.getProjectTriggers();
  for (const declencheur of declencheurs) {
    if (declencheur.getHandlerFunction() === CONFIG.FUNCTION_NAME) {
      ScriptApp.deleteTrigger(declencheur);
    }
  }

  // Création du nouveau trigger
  ScriptApp.newTrigger(CONFIG.FUNCTION_NAME)
    .timeBased()
    .everyDays(1)
    .atHour(CONFIG.TRIGGER_HOUR)
    .nearMinute(CONFIG.TRIGGER_MINUTE)
    .create();
};

/**
 * Menu "À propos" exigé par les consignes.
 */
const onOpen = (e) => {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('GCal Reminder')
      .addItem('À propos', 'afficherAPropos')
      .addToUi();
  } catch (error) {
    // Échec silencieux si le script est autonome et n'a pas d'interface utilisateur (UI) attachée
  }
};

/**
 * Affiche la modale À propos avec les informations du développeur.
 */
const afficherAPropos = () => {
  const html = HtmlService.createHtmlOutput(`
    <div style="font-family: 'Outfit', sans-serif; text-align: center; padding: 20px;">
      <h2>GCal RSVP Reminder</h2>
      <p>Un outil pour automatiser vos relances Google Agenda.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p>Développé par : <strong>Fabrice Faucheux</strong></p>
      <p><a href="https://faucheux.bzh" target="_blank" style="color: #2563eb; text-decoration: none;">https://faucheux.bzh</a></p>
    </div>
  `)
  .setWidth(350)
  .setHeight(250);
  
  try {
    SpreadsheetApp.getUi().showModalDialog(html, 'À propos');
  } catch(e) {
    // Échec silencieux si aucune UI
  }
};
