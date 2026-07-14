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
  FUNCTION_NAME: 'rappels'
};

/**
 * Envoie des rappels par e-mail aux invités n'ayant pas encore répondu aux événements du jour.
 */
const rappels = () => {
  try {
    const today = new Date();
    const defaultCalendar = CalendarApp.getDefaultCalendar();
    const events = defaultCalendar.getEventsForDay(today);

    const scriptTimeZone = Session.getScriptTimeZone();
    const currentUserEmail = Session.getEffectiveUser().getEmail();

    // Détection de la langue de l'utilisateur
    const userLocale = Session.getActiveUserLocale();
    const lang = (userLocale && userLocale.toLowerCase().startsWith('fr')) ? 'fr' : 'en';

    // Textes pour l'e-mail (Code)
    const t = {
      fr: {
        subject: (title, startTime) => `Rappel pour ${title} | ⏰ ${startTime} heure.`,
        fallback: "Veuillez activer l'affichage HTML pour voir ce message."
      },
      en: {
        subject: (title, startTime) => `Reminder: ${title} | ⏰ ${startTime}`,
        fallback: "Please enable HTML view to see this message."
      }
    };

    const senderName = defaultCalendar.getName();
    
    // Préparation du template HTML (optimisation : chargé une seule fois)
    const htmlTemplate = HtmlService.createTemplateFromFile(CONFIG.TEMPLATE_FILE);

    for (const event of events) {
      // Ignorer les événements dont on n'est pas le propriétaire
      if (!event.isOwnedByMe()) continue;
      
      // Ignorer les événements dont l'heure de début est déjà passée
      if (event.getStartTime() < today) continue;

      const guests = event.getGuestList(false);
      // Filtrer uniquement les invités n'ayant pas répondu
      const pendingGuests = guests.filter(guest => guest.getGuestStatus() === CalendarApp.GuestStatus.INVITED);

      if (pendingGuests.length === 0) continue;

      // Extraction des données communes à l'événement
      const title = event.getTitle();
      const description = event.getDescription();
      const eventId = event.getId().split('@')[0];
      const startTime = Utilities.formatDate(event.getStartTime(), scriptTimeZone, 'HH:mm');
      const subject = t[lang].subject(title, startTime);

      for (const guest of pendingGuests) {
        try {
          const email = guest.getEmail();

          // Création de l'ID compatible avec les URL de Google Agenda 
          const encodedId = Utilities.base64EncodeWebSafe(`${eventId} ${email}`).replace(/=/g, '');

          // Utilisation de l'URL moderne Google Agenda
          const meetingLink = `https://calendar.google.com/calendar/event?action=VIEW&eid=${encodedId}`;

          // Injection des données et génération du HTML
          htmlTemplate.data = [title, description, meetingLink, lang];
          const htmlBody = htmlTemplate.evaluate().getContent();

          // Envoi de l'email avec le nom récupéré dynamiquement
          GmailApp.sendEmail(email, subject, t[lang].fallback, {
            name: senderName,
            cc: currentUserEmail,
            htmlBody: htmlBody
          });
        } catch (emailError) {
          console.error(`Erreur lors de l'envoi du rappel à ${guest.getEmail()} pour l'événement "${title}" : ${emailError.message}`);
        }
      }
    }
  } catch (error) {
    console.error(`Erreur critique globale lors de l'exécution du script : ${error.message}`);
  }
};

/**
 * Crée un déclencheur quotidien pour exécuter la fonction de rappels à 8h01.
 * Supprime les anciens déclencheurs pour éviter les envois en double.
 */
const ajoutTrigger = () => {
  // Nettoyage des anciens triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === CONFIG.FUNCTION_NAME) {
      ScriptApp.deleteTrigger(trigger);
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
