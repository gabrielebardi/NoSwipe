//
//  RegisterView.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//

import SwiftUI

struct RegisterView: View {
    @State private var username = ""
    @State private var email = ""
    @State private var password = ""
    @State private var gender = ""
    @State private var age = ""
    @State private var location = ""
    @State private var successMessage = ""
    @State private var errorMessage = ""
    
    var body: some View {
        VStack {
            Text("Register")
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
            
            SecureField("Password", text: $password)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding([.leading, .trailing, .bottom], 10)
            
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
            
            Button("Register") {
                guard let ageInt = Int(age) else {
                    self.errorMessage = "Please enter a valid age."
                    return
                }
                NetworkManager.shared.register(
                    username: username,
                    email: email,
                    password: password,
                    gender: gender,
                    age: ageInt,
                    location: location
                ) { result in
                    DispatchQueue.main.async {
                        switch result {
                        case .success:
                            self.successMessage = "Registration successful! Please log in."
                            self.errorMessage = ""
                        case .failure(let error):
                            self.errorMessage = error.localizedDescription
                            self.successMessage = ""
                        }
                    }
                }
            }
            .foregroundColor(.white)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.green)
            .cornerRadius(8)
            .padding([.leading, .trailing], 10)
            
            Spacer()
        }
        .padding()
    }

    struct RegisterView_Previews: PreviewProvider {
        static var previews: some View {
            RegisterView()
        }
    }
}
