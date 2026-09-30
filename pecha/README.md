# Pecha

Englische Gebetstexte in das lose Blattformat des tibetischen Gebetbuchs setzen,
beidseitig auf A4 drucken, schneiden — und über die Zeit eine Sammlung anlegen.

`index.html` im Browser öffnen — kein Build, kein Server, kein fremdes JavaScript.
Die einzige Anfrage nach außen ist das Google-Fonts-Stylesheet; ohne es fällt die
Seite auf die System-Serife zurück und bleibt voll benutzbar.

## Was sie tut

Drei Bereiche hinter drei Reitern — `#sammlung`, `#setzen`, `#lesen`.

- **Setzen** — Titel, Randkürzel und Text einfügen. Der Satz entsteht sofort:
  die Vorschau zeigt jede Blattseite so, wie sie aus dem Drucker kommt.
- **Sammlung** — ein Regal statt einer Liste: jeder Text sein eigenes Fach,
  durchsuchbar über Titel und Inhalt. Sichern und Einlesen als JSON-Datei.
- **Lesen** — eine Blattseite groß auf dem Schirm, weiter mit den Pfeiltasten.
  Für die Rezitation, wenn nichts gedruckt ist.

## Die drei Formate

Jedes teilt den A4-Bogen in gleich hohe Streifen, deshalb wird ein Blatt immer
nur **gerade quer** geschnitten, nie längs.

| | Blattmaß | Verhältnis | je Bogen | Zeilen | Schrift | Zeichen/Seite |
|---|---|---|---|---|---|---|
| **A — Groß** | 210 × 148,5 mm | 1,4 : 1 | 2 | 6 | ~26 pt | ~215 |
| **B — Klassisch schmal** | 297 × 70 mm | 4,2 : 1 | 3 | 5 | ~15 pt | ~475 |
| **C — Mittel** | 210 × 99 mm | 2,1 : 1 | 3 | 6 | ~19 pt | ~305 |

C ist die Voreinstellung: pecha-hafte Proportion, große Schrift, und ein Gebet
braucht selten mehr als vier Blätter. Zeilenzahl, Schriftgröße, Rand und
Zeilenabstand sind Schieberegler — das Blatt kann nie überlaufen, die Werte
werden auf das Format zurückgeschnitten.

## Warum der Zeilenumbruch selbst gerechnet wird

Ein Pecha hat eine feste Zeilenzahl je Seite. Der Browser kennt diese Regel
nicht — er füllt Kästen. Deshalb bricht die App den Text selbst um: sie misst
im wirklichen Schriftschnitt, an welchen Stellen eine Zeile beginnt (nach
Leerzeichen, nach Bindestrichen, und innerhalb eines Wortes, das breiter als
die halbe Spalte ist), und gibt danach **jede Zeile als eigenen Kasten mit
`nowrap`** aus. Vorschau und Druck können so nicht auseinanderlaufen, und die
Seite ist exakt so voll, wie sie sein soll.

Läuft die Schrift erst später ein, wird nach `document.fonts.ready` neu
gemessen — die Umbrüche gelten immer für den Schnitt, der tatsächlich steht.

## Drucken

**Blätter drucken** schießt die Seiten auf A4 aus: Vorderseiten auf den einen
Bogen, die zugehörigen Rückseiten auf den nächsten, in der Reihenfolge, die
nach dem Schneiden einen richtigen Stapel ergibt. Fehlende Blätter am Ende
bleiben als leere Streifen stehen, damit die Schnitte über alle Bögen an
derselben Stelle liegen.

**Der Testbogen** klärt die eine Einstellung, die kein Handbuch verlässlich
angibt: ob der Drucker über die lange oder die kurze Kante wendet. Er druckt
vorn `V1 V2 V3` und hinten `R1 R2 R3`. Schneiden, Streifen aufeinanderlegen —
steht hinter `V1` die `R1`, stimmt es. Sonst im Setzen-Bereich auf die andere
Kante umstellen. Danach stimmt jeder weitere Druck.

Die weinroten Randbänder an beiden Schmalseiten beginnen rund 4,5 mm vom
Blattrand, also außerhalb des Bereichs, den übliche Drucker nicht bedrucken
können — wer sie bündig will, schneidet den weißen Streifen außen ab. Die
Foliozahl hängt als kleiner weinroter Reiter rechts am Band, das Kürzel steht
in Gold links; beide bleiben zwischen Band und Textspiegel.

## Ein eigenes Titelblatt

*Eigenes Titelblatt, mittig* legt dem Text ein eigenes Blatt voran: der
Titel groß und in beiden Richtungen mittig auf der Seite, die Rückseite
bleibt leer, der eigentliche Text beginnt sauber auf dem nächsten Blatt.
Kein Teil des Fließtexts, keine Zeile aus dem gewöhnlichen Zeilenraster —
ein Titelblatt, wie ein Buch eines hat. Ein sehr langer Titel bricht in
mehrere Zeilen um, statt über den Rand zu laufen.

Darunter, kleiner gesetzt, kann ein *Untertitel* stehen — etwa der Autor
und die Lebensdaten, so wie es zum Beispiel in Thupten Jinpas Büchern oft
gemacht wird ("Langri Tangpa (1054–1123)"). Das Feld ist optional und
bleibt leer, solange nichts eingetragen ist; ohne Titel erscheint auch
kein Untertitel, da es dann gar kein Titelblatt gibt.

## Spalten je Seite

Gedruckte Pecha-Bücher setzen ein Gebet gern in zwei oder drei Spalten
nebeneinander, statt jede Strophe für sich eine halbe Seite Leerraum unter
sich haben zu lassen. Dafür gibt es *Spalten je Seite*: 1, 2 oder 3.

**Die Strophen fließen von Spalte zu Spalte**, wie in einem gesetzten Buch:
Eine Strophe (ein Absatz, also Zeilen ohne Leerzeile dazwischen) folgt in
derselben Spalte auf die vorige, durch eine Leerzeile abgesetzt. Passt sie
dort nicht mehr ganz hinein, beginnt sie oben in der nächsten Spalte, dann
auf der nächsten Seite. **Eine Strophe wird nie zerrissen**, weder zwischen
zwei Spalten noch zwischen zwei Seiten; geteilt wird nur eine, die für sich
allein höher ist als eine ganze Spalte. Das gilt auch bei einer Spalte.

*Zeilen je Seite* ist die Höhe einer Spalte. Weil eine Spalte nur halb oder
ein Drittel so breit ist wie die Seite, muss die Schrift entsprechend kleiner
werden, damit die Zeilen ganz bleiben (siehe *Satz nach Zeilen*). Deshalb
springt *Zeilen je Seite* beim Umschalten der Spaltenzahl automatisch mit
(Basiswert des Formats mal Spaltenzahl); die zusätzlichen Zeilen nehmen im
Fluss einfach weitere Strophen auf. Der Regler bleibt danach frei einstellbar.

Zwei Steuerzeichen lenken den Fluss von Hand (siehe unten): `|||` beginnt
eine neue Spalte, `...` hält eine Strophe mit der vorigen zusammen, so dass
beide immer in derselben Spalte stehen.

## Satz nach Zeilen

In gedruckten Pecha-Gebetsbüchern bleibt eine Zeile der Vorlage eine Zeile:
Nicht die Spalte bestimmt, wo umbrochen wird, sondern die längste Zeile
bestimmt, wie breit die Spalte ist. *Satz nach Zeilen* (für neue und
bestehende Texte eingeschaltet) macht es genauso:

- Jede Spalte ist so breit wie die längste Zeile des ganzen Textes. Das Raster
  ist für alle Blätter gleich, damit die Spalten beim Blättern nicht springen.
- Was an Breite übrig bleibt, geht zu gleichen Teilen an den Seitenrand und an
  die Abstände zwischen den Spalten. Kurze Zeilen stehen also mit viel Luft
  mittig im Blatt, lange füllen es.
- *Seitenrand* ist dann ein Mindestrand; der Spaltenabstand ist mindestens
  anderthalb Schriftgrößen.
- Umbrochen wird nur eine Zeile, die auch bei Mindestrand und knappstem
  Spaltenabstand nicht passt. Ein Hinweis unter den Einstellungen sagt, wie
  viele das sind; weniger Spalten oder eine kleinere Schrift halten sie ganz.

Das setzt voraus, dass die Zeilenumbrüche der Vorlage beibehalten werden;
bei fließendem Text gilt wie bisher die volle Satzbreite.

## Steuerzeichen im Text

- `---` (eigene Zeile) — Umbruch auf die **nächste Seite**.
- `===` (eigene Zeile) — Beginn eines **neuen Blattes**; die Rückseite davor
  bleibt leer, damit sich ein Gebet als eigener Stapel herausnehmen lässt.
- `|||` (eigene Zeile) — Beginn einer **neuen Spalte**.
- `# Text` — eine **Überschrift** in Weinrot. Sie beginnt eine neue Strophe
  und bleibt immer bei den Zeilen darunter, auch wenn eine Leerzeile folgt:
  eine Überschrift steht nie allein am Fuß einer Spalte.
- `[[Bild 1]]` (eigene Zeile) — setzt das erste Bild des Textes auf eine
  **eigene Seite**. Der Knopf *Bild einfügen* legt es an und setzt die Zeile
  an die Stelle, an der gerade der Cursor steht.
- `...` (eigene Zeile, statt der Leerzeile zwischen zwei Strophen) — hält die
  zweite Strophe **mit der ersten zusammen**; passt das Paar nicht mehr in
  die laufende Spalte, wandern beide gemeinsam in die nächste.

Leerzeilen trennen Strophen (Absätze). Ist *Zeilenumbrüche aus der Vorlage beibehalten* gesetzt
(Voreinstellung), behält innerhalb eines Absatzes jede Eingabezeile ihr
eigenes Zeilenende, statt zu einem Fließtext zusammengefasst zu werden — ein
vierzeiliger Vers bleibt so eine Strophe, solange zwischen seinen vier Zeilen
keine Leerzeile steht, und jede seiner vier Zeilen behält ihren eigenen
Umbruch (wichtig für die Versgliederung beim Rezitieren, und dafür, dass
Blocksatz eine Verszeile nie über die ganze Spaltenbreite auseinanderzieht).

## Bandfarbe

Gedruckte Gebetsbücher geben jedem Gebet eine eigene Farbe an den Rändern,
damit man es im Stapel sofort wiederfindet. *Farbe der Randbänder* stellt
das je Text ein: Weinrot (Voreinstellung), Lapisblau, Grün oder Safran. Die
Farbe trägt das Band und der Folio-Reiter; Titel und Überschriften bleiben
Weinrot. Im Regal der Sammlung ist das Bündel in derselben Farbe gebunden.

## Bildseiten

*Bild einfügen* unter dem Textfeld nimmt ein Foto vom Gerät, etwa eine
Thangka-Abbildung, und stellt es mittig auf eine eigene Seite, mit Band und
Foliozahl wie jede andere. Das Bild wird dabei auf 1200 Pixel an der langen
Seite verkleinert: gedruckt reicht das für rund 250 dpi, und ein Bild belegt
nur etwa 150 kB. Der Speicher des Browsers ist klein (auf dem iPhone rund
5 MB); ist er voll, nimmt die App das Bild wieder heraus und sagt es,
statt still Änderungen zu verlieren. Die Bilder stehen als Kärtchen unter dem
Textfeld; das × entfernt ein Bild samt seiner Zeile im Text. *Sammlung
sichern* nimmt die Bilder mit.

## Zählung

Blätter werden nach Blatt gezählt, nicht nach Seite: 1a, 1b, 2a, 2b … Bei losen
Blättern ist die Foliozahl im linken Rand die einzige Ordnung, die der Stapel hat.

## Das Regal

Die Sammlung zeigt keine Liste, sondern ein offenes Fach-Regal — wie die
Bibliotheken tibetischer Klöster, in denen jedes lose gebundene Pecha
eingehüllt und liegend in seinem eigenen Fach steht. Jeder gesetzte Text
ist ein in Stoff gebundenes Bündel mit dem Kürzel am Anhänger, Titel und
Format darunter; ein Fach antippen öffnet den Text zum Bearbeiten. Am Ende
wartet immer genau ein gestricheltes Fach mit einem Plus — antippen legt
einen neuen Text an. Das Regal wächst von selbst mit jedem weiteren Text.

## Lesen im Vollbild

Der Reiter *Lesen* öffnet den gewählten Text immer im Vollbild: Kopfzeile und
Reiterleiste verschwinden, das Blatt füllt den Bildschirm so weit wie sein
Format es zulässt. Nach vorn und zurück blättert man, wie bei einem echten
Stapel loser Blätter, mit einer Wischgeste über das Blatt — nach links für
das nächste, nach rechts für das vorige; die ‹ ›-Tasten und die Pfeiltasten
der Tastatur tun dasselbe. Der Kreis mit dem Kreuz oben links (oder die
Escape-Taste) verlässt das Vollbild wieder und legt Kopfzeile, Reiterleiste
und die Textauswahl frei — etwa um einen anderen Text aus der Sammlung zu
wählen. Ein Blattform-Symbol daneben führt zurück ins Vollbild.

## Auf den Homescreen

Die Seite ist eine installierbare Web-App. Über GitHub Pages aufrufen, dann:

- **iPhone/iPad (Safari):** Teilen-Menü → *Zum Home-Bildschirm*. Das Symbol kommt
  aus `apple-touch-icon.png`; iOS rundet die Ecken selbst, deshalb ist die Datei
  randlos und ohne Transparenz.
- **Android (Chrome):** Menü → *App installieren* bzw. *Zum Startbildschirm*.
  Für die runde Maske adaptiver Symbole liegt `icon-maskable-512.png` bei, in dem
  die Vase so weit eingerückt ist, dass der Beschnitt sie nicht an den Ecken kappt.
- **Desktop (Chrome/Edge):** Installationssymbol in der Adressleiste.

Einmal geöffnet, arbeitet die App offline weiter: der Service Worker hält Seite,
Manifest und Symbole vor und holt die Seite bei Netz frisch nach, damit
Änderungen ankommen. Die Schrift kommt beim ersten Aufruf mit ins Cache.

## Wo die Texte liegen

Im `localStorage` dieses Browsers, auf diesem Gerät. Kein Konto, keine Übertragung,
kein Netz. Geleerte Browserdaten nehmen die Sammlung mit — **Sammlung sichern**
legt sie als Datei ab, **einlesen** holt sie zurück oder auf ein anderes Gerät.
Beim Einlesen gewinnt je Eintrag die neuere Fassung; nichts wird überschrieben,
was neuer ist.

## Bewusst nicht drin

- **Kein Tibetisch und keine Phonetik.** Tibetisch bricht nur am Tsheg um, nie
  vor einem Shad, und ein falsch gesetztes Tibetisch im eigenen Gebetbuch ist
  schlimmer als gar keins. Die App setzt lateinische Schrift.
- **Kein Abgleich zwischen Geräten.** Datei sichern und einlesen statt Konto.
- **Kein Blocksatz mit Silbentrennung** — Blocksatz dehnt nur die Wortabstände.

## Das Symbol

Die **Schatzvase** (*bum pa*), eines der Acht Glückssymbole — das Gefäß, dessen
Inhalt nicht ausgeht. Für eine Sammlung, die über die Jahre wächst, das passendste
der acht; der endlose Knoten war ohnehin vergeben, den trägt `lojong`.

## Gestaltung

Die App-Oberfläche teilt die Palette mit `lojong`: Sandsteingrund,
*btsod*-Bordeaux, Lapis, Gold; nachts tiefes Nachtlapis. Hell und dunkel
folgen der Systemeinstellung, mit Schalter zum Übergehen.

Das Blatt selbst folgt einem gedruckten zeitgenössischen Pecha-Gebetsbuch:
weißes Papier statt Pergamentton, zwei weinrote Bänder an den Schmalseiten
statt Doppellinien, die Foliozahl weiß auf weinrotem Reiter. Der Titel steht
halbfett in Weinrot, der Untertitel kleiner in warmem Grau, darüber ein
schmales goldenes Zierband mit Raute — dort, wo im Vorbild die tibetische
Titelzeile in Gold steht. Gold bleibt sonst dem Kürzel vorbehalten, so wie es
im Vorbild die heilige Schriftzeile auszeichnet. Der Text ist ein weiches
Anthrazit statt Schwarz, gesetzt in *Crimson Pro*, der freien Schwester der
Minion, in der solche Gebetsbücher meist gesetzt sind. Im Regal sind die
Bündel entsprechend weinrot gebunden, mit goldener Schnur.
