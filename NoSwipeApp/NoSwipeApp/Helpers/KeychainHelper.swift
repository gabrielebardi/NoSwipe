//
//  KeychainHelper.swift
//  NoSwipeApp
//
//  Created by G B on 11/20/2024.
//

import Foundation
import Security

final class KeychainHelper {
    static let shared = KeychainHelper()
    
    private init() {}
    
    /// Saves data to the Keychain.
    /// - Parameters:
    ///   - data: The data to be saved.
    ///   - service: A string that identifies a service associated with the data.
    ///   - account: A string that identifies an account associated with the data.
    /// - Returns: A boolean indicating the success of the operation.
    @discardableResult
    func save(_ data: Data, service: String, account: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String       : kSecClassGenericPassword,
            kSecAttrService as String : service,
            kSecAttrAccount as String : account
        ]
        
        // Delete any existing items
        SecItemDelete(query as CFDictionary)
        
        // Add the new keychain item
        var newItem = query
        newItem[kSecValueData as String] = data
        
        let status = SecItemAdd(newItem as CFDictionary, nil)
        return status == errSecSuccess
    }
    
    /// Reads data from the Keychain.
    /// - Parameters:
    ///   - service: A string that identifies a service associated with the data.
    ///   - account: A string that identifies an account associated with the data.
    /// - Returns: The retrieved data if successful, otherwise nil.
    func read(service: String, account: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String       : kSecClassGenericPassword,
            kSecAttrService as String : service,
            kSecAttrAccount as String : account,
            kSecReturnData as String  : true,
            kSecMatchLimit as String  : kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        guard status == errSecSuccess else {
            print("Keychain read error: \(self.keychainErrorMessage(for: status))")
            return nil
        }
        
        return dataTypeRef as? Data
    }
    
    /// Deletes data from the Keychain.
    /// - Parameters:
    ///   - service: A string that identifies a service associated with the data.
    ///   - account: A string that identifies an account associated with the data.
    /// - Returns: A boolean indicating the success of the operation.
    @discardableResult
    func delete(service: String, account: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String       : kSecClassGenericPassword,
            kSecAttrService as String : service,
            kSecAttrAccount as String : account
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess
    }
    
    /// Saves a string to the Keychain.
    /// - Parameters:
    ///   - string: The string to be saved.
    ///   - service: A string that identifies a service associated with the data.
    ///   - account: A string that identifies an account associated with the data.
    /// - Returns: A boolean indicating the success of the operation.
    @discardableResult
    func saveString(_ string: String, service: String, account: String) -> Bool {
        guard let data = string.data(using: .utf8) else { return false }
        return save(data, service: service, account: account)
    }
    
    /// Reads a string from the Keychain.
    /// - Parameters:
    ///   - service: A string that identifies a service associated with the data.
    ///   - account: A string that identifies an account associated with the data.
    /// - Returns: The retrieved string if successful, otherwise nil.
    func readString(service: String, account: String) -> String? {
        guard let data = read(service: service, account: account) else { return nil }
        return String(data: data, encoding: .utf8)
    }
    
    /// Provides a human-readable error message for a given Keychain status code.
    /// - Parameter status: The OSStatus code returned by a Keychain operation.
    /// - Returns: A string describing the error.
    private func keychainErrorMessage(for status: OSStatus) -> String {
        if #available(iOS 11.3, *) {
            if let error = SecCopyErrorMessageString(status, nil) as String? {
                return error
            }
        }
        return "Unknown error with code: \(status)"
    }
}