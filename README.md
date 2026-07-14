# gcal-rsvp-reminder ⏰

[🇫🇷 Version Française](#-version-française) | [🇬🇧 English Version](#-english-version)

---

## 🇫🇷 Version Française

Un script Google Apps Script simple et efficace pour relancer automatiquement les invités qui n'ont pas encore répondu à vos événements Google Agenda.

### L'intérêt de l'outil

Lorsque l'on organise des réunions, il est fréquent que certains participants oublient de confirmer leur présence. Ce script vous fait gagner du temps en automatisant les rappels :
- **Entièrement automatique** : S'exécute chaque jour (par exemple à 8h01) pour vérifier les événements de la journée.
- **Ciblé** : N'envoie un e-mail qu'aux invités dont le statut est "En attente" (`INVITED`).
- **Facile d'utilisation pour l'invité** : L'e-mail contient un bouton avec un lien direct pour mettre à jour son statut RSVP.
- **Bilingue** : Le script s'adapte automatiquement à la langue de votre compte Google (Français ou Anglais) pour envoyer les e-mails dans la bonne langue.

### Installation

1. Copiez les fichiers `Code.gs` et `email.html` dans un nouveau projet Google Apps Script.
2. Exécutez une première fois la fonction `ajoutTrigger()` pour autoriser le script et installer le déclencheur quotidien.
3. C'est tout ! Vos rappels partiront désormais tout seuls.

---

## 🇬🇧 English Version

A simple and efficient Google Apps Script to automatically remind guests who haven't responded to your Google Calendar events.

### Why use this tool?

When organizing meetings, participants often forget to confirm their attendance. This script saves you time by automating reminders:
- **Fully automated**: Runs daily (e.g., at 8:01 AM) to check the day's events.
- **Targeted**: Only sends an email to guests with a "Pending" status (`INVITED`).
- **User-friendly for guests**: The email includes a direct link button to update their RSVP status easily.
- **Bilingual**: The script automatically adapts to your Google Account language (French or English) to send emails in the correct language.

### Installation

1. Copy the `Code.gs` and `email.html` files into a new Google Apps Script project.
2. Run the `ajoutTrigger()` function once to authorize the script and install the daily trigger.
3. That's it! Your reminders will now be sent automatically.
