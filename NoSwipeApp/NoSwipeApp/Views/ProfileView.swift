//
//  UserProfile.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//


import SwiftUI


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
        NetworkManager.shared.fetchProfile { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let user):
                    self.username = user.username
                    self.email = user.email
                    self.gender = user.gender ?? ""
                    self.age = String(user.age ?? 0)
                    self.location = user.location ?? ""
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    func updateProfile(username: String, email: String, gender: String, age: Int, location: String) {
        NetworkManager.shared.updateProfile(
            username: username,
            email: email,
            gender: gender,
            age: age,
            location: location
        ) { result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    self.successMessage = "Profile updated successfully."
                    self.errorMessage = ""
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
    }
}