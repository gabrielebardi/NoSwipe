//
//  UserProfile.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//


import SwiftUI

struct UserProfile: Codable {
    let username: String
    let email: String
    let gender: String?
    let age: Int?
    let location: String?
}

struct ProfileView: View {
    @State private var username = ""
    @State private var email = ""
    @State private var gender = ""
    @State private var age = ""
    @State private var location = ""
    @State private var errorMessage = ""
    @State private var successMessage = ""
    
    var body: some View {
        VStack {
            Text("Your Profile")
                .font(.largeTitle)
                .padding()
            
            TextField("Username", text: $username)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding([.leading, .trailing, .bottom], 10)
            
            TextField("Email", text: $email)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding([.leading, .trailing, .bottom], 10)
                .keyboardType(.emailAddress)
                .autocapitalization(.none)
            
            TextField("Gender", text: $gender)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding([.leading, .trailing, .bottom], 10)
            
            TextField("Age", text: $age)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding([.leading, .trailing, .bottom], 10)
                .keyboardType(.numberPad)
            
            TextField("Location", text: $location)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding([.leading, .trailing, .bottom], 10)
            
            if !successMessage.isEmpty {
                Text(successMessage)
                    .foregroundColor(.green)
                    .padding([.leading, .trailing, .bottom], 10)
            }
            
            if !errorMessage.isEmpty {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .padding([.leading, .trailing, .bottom], 10)
            }
            
            Button("Update Profile") {
                guard let ageInt = Int(age) else {
                    self.errorMessage = "Please enter a valid age."
                    return
                }
                updateProfile(username: username, email: email, gender: gender, age: ageInt, location: location)
            }
            .foregroundColor(.white)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.blue)
            .cornerRadius(8)
            .padding([.leading, .trailing], 10)
            
            Spacer()
        }
        .padding()
        .onAppear {
            // Fetch user profile data from the backend
            fetchProfile()
        }
    }
    
    func fetchProfile() {
        guard let url = URL(string: "http://127.0.0.1:8000/api/auth/user/") else { return }
        
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
                let user = try JSONDecoder().decode(UserProfile.self, from: data)
                DispatchQueue.main.async {
                    self.username = user.username
                    self.email = user.email
                    self.gender = user.gender ?? ""
                    self.age = String(user.age ?? 0)
                    self.location = user.location ?? ""
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = error.localizedDescription
                }
            }
        }.resume()
    }
    
    func updateProfile(username: String, email: String, gender: String, age: Int, location: String) {
        guard let url = URL(string: "http://127.0.0.1:8000/api/auth/user/") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Retrieve token from Keychain
        if let tokenData = KeychainHelper.shared.read(service: "NoSwipeApp", account: "authToken"),
           let token = String(data: tokenData, encoding: .utf8) {
            request.setValue("Token \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let body: [String: Any] = [
            "username": username,
            "email": email,
            "gender": gender,
            "age": age,
            "location": location
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                DispatchQueue.main.async {
                    self.errorMessage = error.localizedDescription
                }
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                DispatchQueue.main.async {
                    self.errorMessage = "Invalid response."
                }
                return
            }
            
            if (200...299).contains(httpResponse.statusCode) {
                DispatchQueue.main.async {
                    self.successMessage = "Profile updated successfully."
                    self.errorMessage = ""
                }
            } else {
                DispatchQueue.main.async {
                    self.errorMessage = "Failed to update profile."
                }
            }
        }.resume()
    }
}

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
    }
}