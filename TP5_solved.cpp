#include <stdio.h>
#include <string.h>
#define MAX 100

// Structures
typedef struct {char nom[20];char prenom[20];int age;} Patient;
typedef struct {char nom[20];char telephone[15];char email[30];} Contact;
typedef struct {char titre[30];char auteur[20];int annee;} Livre;
typedef struct {char nom[20];char prenom[20];float note1;float note2;} Etudiant;
typedef struct {char ref[15];char designation[30];int quantite;} Produit;
typedef struct {char titre[30];char genre[15];int duree;} Film;
typedef struct {char matricule[10];char nom[20];float salaire;} Employe;
typedef struct {char libelle[30];float prixHT;float tva;} Article;
typedef struct {char numero[15];char nomClient[20];float solde;} Compte;
typedef struct {char login[15];char motdepasse[15];char role[10];} Utilisateur;

// simple stub exercises
void exercice1(void){printf("[Exercise 1 patients] not implemented\n");}
void exercice2(void){printf("[Exercise 2 contacts] not implemented\n");}
void exercice3(void){printf("[Exercise 3 livres] not implemented\n");}
void exercice4(void){printf("[Exercise 4 etudiants] not implemented\n");}
void exercice5(void){printf("[Exercise 5 produits] not implemented\n");}
void exercice6(void){printf("[Exercise 6 films] not implemented\n");}
void exercice7(void){printf("[Exercise 7 employes] not implemented\n");}
void exercice8(void){printf("[Exercise 8 articles] not implemented\n");}
void exercice9(void){printf("[Exercise 9 comptes] not implemented\n");}
void exercice10(void){printf("[Exercise 10 utilisateurs] not implemented\n");}

int main(void){
    printf("TP5 solver placeholder.\n");
    exercice1();
    return 0;
}
