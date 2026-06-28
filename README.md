# Cel Dnia

Prosta aplikacja webowa do definiowania jednego celu dziennie.

Projekt jest pierwszym etapem nauki i rozwoju aplikacji webowej. Aktualnie najważniejszy jest działający główny cel: użytkownik może zapisać cel na dany dzień, oznaczyć go jako wykonany albo niewykonany i zobaczyć podstawowy postęp.

## Aktualny zakres

- zapis jednego celu dla wybranego dnia,
- oznaczanie celu jako zrobiony albo niezrobiony,
- lokalny zapis danych w przeglądarce przez `localStorage`,
- lokalne tworzenie konta i logowanie użytkownika,
- zapisywanie celów osobno dla każdego użytkownika,
- wyświetlanie aktualnej serii, najdłuższej serii i skuteczności,
- widok ostatnich 7 dni,
- historia ostatnich celów,
- uruchomienie bez instalowania pakietów i bez serwera.

## Planowany kierunek rozwoju

Aplikacja ma zostać rozbudowana z lokalnej wersji demonstracyjnej do wersji z profilami użytkowników i bazą danych. Docelowo dane nie powinny być zapisywane wyłącznie w `localStorage`, tylko w bazie przypisanej do konkretnego profilu.

## Założenia techniczne

- Docelową bazą danych aplikacji będzie Supabase.
- Supabase ma przechowywać dane użytkowników, profili, celów dziennych i zapisanych podsumowań.
- Wybór Supabase wynika z relacyjnego charakteru danych aplikacji: użytkownik ma wiele celów i wiele podsumowań, a aplikacja będzie filtrować dane po dniach, tygodniach, miesiącach i własnych zakresach dat.
- Na dalszym etapie warto wykorzystać Supabase Auth zamiast własnego zapisu haseł w bazie.
- Obecny zapis w `localStorage` pozostaje tylko jako lokalny prototyp do czasu przeniesienia danych do Supabase.

Planowane funkcje:

- logowanie użytkowników,
- tworzenie profili na podstawie unikatowej nazwy użytkownika,
- zapis celów dziennych w bazie danych,
- zapis statusu celu dla konkretnego dnia,
- możliwość dodawania podsumowania dnia,
- możliwość dodawania podsumowania tygodnia,
- generowanie podsumowania dla wybranego zakresu dat,
- zapis wygenerowanych podsumowań pod profilem użytkownika.

## Profile i logowanie

Na pierwszym etapie logowanie może być proste i edukacyjne:

- użytkownik podaje login i hasło,
- login musi być unikatowy,
- konto tworzy osobny profil użytkownika,
- dane celu i podsumowań są przypisane do profilu,
- hasło może być zapisane w formie plain text na potrzeby nauki.

Uwaga: zapis hasła jako plain text jest akceptowalny tylko w ramach ćwiczenia lokalnego. W prawdziwej aplikacji hasła powinny być haszowane, a logowanie powinno korzystać z bezpiecznego mechanizmu sesji albo tokenów.

## Baza danych

Baza danych powinna przechowywać podstawowe informacje potrzebne do działania aplikacji.

Przykładowe dane użytkownika:

- identyfikator użytkownika,
- unikatowa nazwa profilu,
- login,
- hasło,
- data utworzenia konta.

Przykładowe dane celu dziennego:

- identyfikator celu,
- identyfikator użytkownika,
- data celu,
- treść celu,
- status: `pending`, `done` albo `missed`,
- data utworzenia,
- data ostatniej aktualizacji.

Przykładowe dane podsumowania:

- identyfikator podsumowania,
- identyfikator użytkownika,
- typ podsumowania: dzienne, tygodniowe albo zakres dat,
- data początkowa zakresu,
- data końcowa zakresu,
- treść podsumowania,
- data utworzenia.

## Podsumowania

W aplikacji powinien pojawić się przycisk `Podsumuj`.

Po kliknięciu użytkownik powinien zobaczyć pop-up albo osobną stronę `Podsumowanie`, gdzie może wybrać zakres, który go interesuje.

Założenia widoku podsumowania:

- użytkownik może wybrać konkretną datę,
- użytkownik może wybrać tydzień,
- użytkownik może wybrać miesiąc,
- użytkownik może wybrać własny zakres dat,
- aplikacja pokazuje cele z wybranego zakresu,
- aplikacja tworzy podsumowanie na podstawie zapisanych celów i ich statusów,
- użytkownik może zapisać podsumowanie w bazie danych,
- zapisane podsumowanie jest przypisane do profilu użytkownika.

Podsumowanie może zawierać:

- liczbę zaplanowanych celów,
- liczbę wykonanych celów,
- liczbę niewykonanych celów,
- skuteczność procentową,
- najczęściej powtarzające się tematy celów,
- krótką ręcznie wpisaną notatkę użytkownika,
- wnioski na kolejny dzień albo tydzień.

## Proponowane etapy prac

1. Utrzymać obecną wersję lokalną jako prosty prototyp.
2. Dodać strukturę projektu z backendem.
3. Dodać bazę danych.
4. Dodać tworzenie kont i logowanie.
5. Przenieść zapis celów z `localStorage` do bazy danych.
6. Dodać widok profilu użytkownika.
7. Dodać przycisk `Podsumuj`.
8. Dodać pop-up albo stronę `Podsumowanie`.
9. Dodać zapis podsumowań w bazie danych.
10. Rozbudować widoki o filtrowanie po dniu, tygodniu, miesiącu i własnym zakresie dat.

## Uruchomienie obecnej wersji

Otwórz plik `index.html` w przeglądarce.

Projekt w obecnej wersji nie wymaga instalowania pakietów ani uruchamiania serwera.
