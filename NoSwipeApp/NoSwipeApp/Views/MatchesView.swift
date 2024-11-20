//
//  User.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//


import SwiftUI

struct User: Identifiable, Codable {
    let id: Int
    let username: String
    let email: String
    let gender: String?
    let age: Int?
    let location: String?
}

struct Match: Identifiable, Codable {
    let id: Int
    let user1: User
    let user2: User
    let score: Float
    let created_at: String
    let expires_at: String
}

struct MatchesView: View {
    @State private var matches: [Match] = []
    @State private var errorMessage = ""

    var body: some View {
        NavigationView {
            List(matches) { match in
                VStack(alignment: .leading) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text("You ↔ \(match.user2.username)")
                                .font(.headline)
                            Text("Score: \(match.score)")
                                .font(.subheadline)
                        }
                        Spacer()
                        Text("Expires: \(formattedDate(match.expires_at))")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    Divider()
                }
                .padding(.vertical, 5)
            }
            .navigationTitle("Your Matches")
            .onAppear {
                fetchMatches()
            }
            .alert(isPresented: Binding<Bool>(
                get: { !errorMessage.isEmpty },
                set: { _ in errorMessage = "" }
            )) {
                Alert(title: Text("Error"), message: Text(errorMessage), dismissButton: .default(Text("OK")))
            }
        }
    }

    func fetchMatches() {
        guard let url = URL(string: "http://127.0.0.1:8000/api/matches/") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"

        // Retrieve token from Keychain
        if let tokenData = KeychainHelper.shared.read(service: "NoSwipeApp", account: "authToken"),
           let token = String(data: tokenData, encoding: .utf8) {
            request.setValue("Token \(token)", forHTTPHeaderField: "Authorization")
        }

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    self.errorMessage = error.localizedDescription
                }
                return
            }

            guard let data = data else {
                DispatchQueue.main.async {
                    self.errorMessage = "No data received."
                }
                return
            }

            do {
                let decoded = try JSONDecoder().decode([Match].self, from: data)
                DispatchQueue.main.async {
                    self.matches = decoded
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = error.localizedDescription
                }
            }
        }.resume()
    }

    func formattedDate(_ dateString: String) -> String {
        // Convert the date string to a more readable format
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .short
            return displayFormatter.string(from: date)
        }
        return dateString
    }
}

struct MatchesView_Previews: PreviewProvider {
    static var previews: some View {
        MatchesView()
    }
}