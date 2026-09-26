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
- **Sammlung** — alle Texte, durchsuchbar über Titel und Inhalt, mit Blattzahl
  und Änderungsdatum. Sichern und Einlesen als JSON-Datei.
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

Die Rahmenlinien stehen 8 mm vom Blattrand und 5 mm von Ober- und Unterkante
entfernt, also außerhalb des Bereichs, den übliche Drucker nicht bedrucken
können. Die Randmarken — Foliozahl links, Kürzel rechts — sitzen im Band
zwischen innerer Linie und Textspiegel, nie auf dem Rahmen.

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

Klassische Pecha-Bücher setzen kurze Gebete gern nebeneinander statt
untereinander — ein knappes Vers neben dem nächsten, statt jedes für sich
eine halbe Seite Leerraum unter sich zu haben. Dafür gibt es *Spalten je
Seite*: 1, 2 oder 3.

Die Regel ist denkbar einfach: **jeder Absatz bekommt seine eigene Spalte**,
sobald mehr als eine Spalte eingestellt ist. Absätze füllen die Spalten von
links nach rechts, dann das nächste Blatt. Ist ein Absatz zu lang für die
eingestellte Zeilenzahl, läuft der Rest ohne erneute Überschrift in die
nächste freie Spalte weiter — nichts geht verloren, nur die Stelle
verschiebt sich. Passt ein Vers nicht vollständig auf eine Seite, hilft es,
*Zeilen je Seite* zu erhöhen oder die Schrift zu verkleinern, bis er ganz in
eine Spalte passt.

Bei einer Spalte (der Voreinstellung) ändert sich nichts: Absätze laufen wie
gewohnt fortlaufend durch, mehrere pro Seite, wie bisher.

Eine Spalte ist nur noch halb (bei zwei) oder ein Drittel (bei drei) so
breit wie die ganze Seite — derselbe Vers braucht darin entsprechend mehr
Zeilen. Deshalb springt *Zeilen je Seite* beim Umschalten der Spaltenzahl
automatisch mit (Basiswert des Formats mal Spaltenzahl), sichtbar am
Regler, und lässt sich von dort aus weiter von Hand anpassen.

Wichtiger als der Startwert: **ein Absatz wird bei Mehrspaltigkeit nie an
der Zeilengrenze zerschnitten.** *Zeilen je Seite* bestimmt hier nur noch,
wie viel Weißraum eine kurze Spalte mindestens bekommt — eine Spalte, deren
Absatz mehr Zeilen braucht, wächst einfach darüber hinaus, statt in die
Nachbarspalte hinein zu laufen. Zwei Verse stehen dadurch immer nebeneinander,
ganz gleich wie kurz oder lang jeder für sich ist und was am Regler steht.

Das setzt voraus, dass es überhaupt zwei Absätze gibt. Ein Gebet, das ohne
Leerzeile am Stück eingefügt wird, ist für die App **ein** Absatz — er füllt
die erste Spalte, die übrigen bleiben leer. Das ist keine Fehlfunktion,
sondern folgt direkt aus „ein Absatz, eine Spalte"; nur ist das im Moment
selbst leicht misszuverstehen, deshalb steht unter den Einstellungen eine
Zeile, die live mitzählt, wie viele Absätze der Text hat, und in Signalfarbe
warnt, sobald es weniger sind als eingestellte Spalten.

Manchmal sollen aber **zwei** Absätze zusammen in eine einzige Spalte —
zwei kurze Gebete, die als Paar gelesen werden. Dafür eine Zeile aus `...`
(drei Punkte, für sich allein) statt der Leerzeile zwischen ihnen: sie
beendet den ersten Absatz genau wie eine Leerzeile, hält den zweiten aber
in derselben Spalte fest, mit einer schmalen Leerzeile als Abstand
dazwischen. Erst ein Absatz *ohne* `...` beginnt wieder eine neue Spalte.

## Steuerzeichen im Text

- `---` (eigene Zeile) — Umbruch auf die **nächste Seite**.
- `===` (eigene Zeile) — Beginn eines **neuen Blattes**; die Rückseite davor
  bleibt leer, damit sich ein Gebet als eigener Stapel herausnehmen lässt.

Leerzeilen trennen Absätze — das ist zugleich die Spaltengrenze bei mehr als
einer Spalte. Ist *Zeilenumbrüche aus der Vorlage beibehalten* gesetzt
(Voreinstellung), behält innerhalb eines Absatzes jede Eingabezeile ihr
eigenes Zeilenende, statt zu einem Fließtext zusammengefasst zu werden — ein
vierzeiliger Vers bleibt so eine Spalte, solange zwischen seinen vier Zeilen
keine Leerzeile steht, aber jede seiner vier Zeilen behält ihren eigenen
Umbruch (wichtig für die Versgliederung beim Rezitieren, und dafür, dass
Blocksatz eine Verszeile nie über die ganze Spaltenbreite auseinanderzieht).

## Zählung

Blätter werden nach Blatt gezählt, nicht nach Seite: 1a, 1b, 2a, 2b … Bei losen
Blättern ist die Foliozahl im linken Rand die einzige Ordnung, die der Stapel hat.

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

Dieselbe Palette wie `lojong`: Sandsteingrund, *btsod*-Bordeaux, Lapis, Gold;
nachts tiefes Nachtlapis, und das Blatt wird mit dunkel, statt weiß zu leuchten.
Hell und dunkel folgen der Systemeinstellung, mit Schalter zum Übergehen.
