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
 * Envoie des rappels par e-mail aux invités n'ayant pas encore répondu aux événements du jour.
 */
const rappels = () => {
  try {
    const today = new Date();
    const defaultCalendar = CalendarApp.getDefaultCalendar();
    const events = defaultCalendar.getEventsForDay(today);
    
    const scriptTimeZone = Session.getScriptTimeZone();
    const currentUserEmail = Session.getEffectiveUser().getEmail();
    
    // ASTUCE : Récupère automatiquement le nom associé à l'agenda principal
    const senderName = defaultCalendar.getName(); 

    for (const event of events) {
      // Ignorer les événements dont on n'est pas le propriétaire
      if (!event.isOwnedByMe()) continue;

      const guests = event.getGuestList(false);
      // Filtrer uniquement les invités n'ayant pas répondu
      const pendingGuests = guests.filter(guest => guest.getGuestStatus() === CalendarApp.GuestStatus.INVITED);

      if (pendingGuests.length === 0) continue;

      // Extraction des données communes à l'événement
      const title = event.getTitle();
      const description = event.getDescription(); 
      const eventId = event.getId().split('@')[0];
      const startTime = Utilities.formatDate(event.getStartTime(), scriptTimeZone, 'HH:mm');
      const subject = `Rappel pour ${title} | ⏰ ${startTime} heure.`;

      for (const guest of pendingGuests) {
        const email = guest.getEmail();
        
        // Création de l'ID compatible avec les URL de Google Agenda 
        const encodedId = Utilities.base64EncodeWebSafe(`${eventId} ${email}`).replace(/=/g, '');
        
        // Utilisation de l'URL moderne Google Agenda
        const meetingLink = `https://calendar.google.com/calendar/event?action=VIEW&eid=${encodedId}`;
        
        // Préparation du template HTML
        const html = HtmlService.createTemplateFromFile('email');
        html.data = [title, description, meetingLink];
        const htmlBody = html.evaluate().getContent();
        
        // Envoi de l'email avec le nom récupéré dynamiquement
        GmailApp.sendEmail(email, subject, 'Veuillez activer l\'affichage HTML pour voir ce message.', {
          name: senderName,
          cc: currentUserEmail,
          htmlBody: htmlBody
        });
      }
    }
  } catch (error) {
    console.error(`Erreur lors de l'envoi des rappels : ${error.message}`);
  }
};

/**
 * Crée un déclencheur quotidien pour exécuter la fonction de rappels à 8h01.
 * Supprime les anciens déclencheurs pour éviter les envois en double.
 */
const ajoutTrigger = () => {
  const functionName = 'rappels';
  
  // Nettoyage des anciens triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Création du nouveau trigger
  ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .nearMinute(1)
    .create();
};
