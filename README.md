# Coucool 2018

## Lancer le projet

**Attention: ne pas cloner le repo git dans un dossier synchronisé sur Google Drive**

### Installer ngrok

1. Télécharger https://ngrok.com/download
2. Lancer la ngrok dans un terminal à part avec la commande suivante:

```bash
ngrok http 8080
```

### Installer les dépendances

```bash
npm install
```

### Lancer le serveur de dev

```bash
npm start
```

On peut maintenant se connecter sur l'url disponible dans webpack et ngrok pour visualiser le site.

Toute modification faite dans le code entrainera le rechargement automatique du site dans le navigateur.

On peut également partager l'url ngrok à d'autres personnes sur Internet, mais la machine de dev doit être active et connectée à Internet.
