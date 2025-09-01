Polynomial Interpolation – Placement Assignment

This repository contains my solution for the Hashira Placement Assignment.
The task was to reconstruct the coefficients of a polynomial given k points in JSON format (with mixed bases for the values).

<img width="546" height="90" alt="Screenshot 2025-09-01 at 12 00 32 PM" src="https://github.com/user-attachments/assets/b67d969b-cb06-4c20-a024-e5bacf631d91" />

How to Run
CLONE THE REPO
git clone https://github.com/<your-username>/Hashira-placement-muj-Ritik-Laxwani.git
cd Hashira-placement-muj-Ritik-Laxwani

Run on the first test case (for checking)
node interpolate.js < first_test.json

Run on the second test case (final output)
node interpolate.js < second_test.json

Example Output

For the second_test.json, the program outputs the polynomial coefficients:
79836264049851 92534348706405 234176747398429 147160079768248 105860038268942 129715447661077 205802168748539

f(x) = 79836264049851 
     + 92534348706405 * x 
     + 234176747398429 * x^2 
     + 147160079768248 * x^3 
     + 105860038268942 * x^4 
     + 129715447661077 * x^5 
     + 205802168748539 * x^6

Output for first test cases
3 0 1

Requirements
Node.js v12+ (uses BigInt for large numbers).

✨ Author
Ritik Laxwani
