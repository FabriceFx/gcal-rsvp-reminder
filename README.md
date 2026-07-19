# gcal-rsvp-reminder ⏰

[🇫🇷 Version Française](#-version-française) | [🇬🇧 English Version](#-english-version)

---

## 🇫🇷 Version Française

Un script Google Apps Script simple et efficace pour relancer automatiquement les invités qui n'ont pas encore répondu à vos événements Google Agenda.

### L'intérêt de l'outil

**23h, la veille d'une réunion cruciale.** Vous parcourez la liste des invités et réalisez que la moitié d'entre eux n'a pas daigné répondre à l'invitation. Allez-vous les relancer un par un manuellement, en craignant qu'ils ne viennent pas, ou perdre un temps précieux à suivre l'état de chacun ? 
Ne laissez plus l'incertitude vous faire perdre votre temps. Ce script vous libère de cette charge mentale en automatisant les rappels :
- **Entièrement automatique** : S'exécute chaque jour (par exemple à 8h01) pour vérifier les événements de la journée.
- **Ciblé** : N'envoie un e-mail qu'aux invités dont le statut est "En attente" (`INVITED`).
- **Facile d'utilisation pour l'invité** : L'e-mail contient un bouton avec un lien direct pour mettre à jour son statut RSVP.
- **Bilingue** : Le script s'adapte automatiquement à la langue de votre compte Google (Français ou Anglais) pour envoyer les e-mails dans la bonne langue.

### Installation

1. Copiez les fichiers `Code.gs` et `email.html` dans un nouveau projet Google Apps Script.
2. Dans l'éditeur, sélectionnez la fonction `ajoutTrigger` dans le menu déroulant en haut de l'écran, puis cliquez sur le bouton **Exécuter**.
3. Une fenêtre apparaîtra : acceptez et accordez les autorisations nécessaires demandées par Google.
4. C'est tout ! Le déclencheur automatique est installé et vos rappels partiront désormais tout seuls.

---

## 🇬🇧 English Version

A simple and efficient Google Apps Script to automatically remind guests who haven't responded to your Google Calendar events.

### Why use this tool?

**11 PM, the night before a crucial meeting.** You scroll through the guest list and realize half of them haven't bothered to respond. Are you going to chase them down one by one manually, worrying if they'll even show up, or waste precious time tracking everyone's status?
Stop letting uncertainty drain your time. This script frees you from this mental burden by automating reminders:
- **Fully automated**: Runs daily (e.g., at 8:01 AM) to check the day's events.
- **Targeted**: Only sends an email to guests with a "Pending" status (`INVITED`).
- **User-friendly for guests**: The email includes a direct link button to update their RSVP status easily.
- **Bilingual**: The script automatically adapts to your Google Account language (French or English) to send emails in the correct language.

### Installation

1. Copy the `Code.gs` and `email.html` files into a new Google Apps Script project.
2. In the editor, select the `ajoutTrigger` function from the dropdown menu at the top, then click the **Run** button.
3. A popup will appear: accept and grant the necessary permissions requested by Google.
4. That's it! The automated trigger is installed and your reminders will now be sent automatically.
