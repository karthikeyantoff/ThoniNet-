// src/components/RealQrCameraScanner.js
// Production Hardware Camera Viewfinder with Real Barcode / QR Decoding
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function RealQrCameraScanner({ visible, onClose, onScanSuccess }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {!permission ? (
          <View style={styles.center}>
            <Text style={styles.text}>Requesting camera permission...</Text>
          </View>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Text style={styles.text}>Hardware camera permission is required to scan vessel QR codes.</Text>
            <TouchableOpacity style={styles.btn} onPress={requestPermission}>
              <Text style={styles.btnText}>GRANT PERMISSION</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : ({ type, data }) => {
              setScanned(true);
              onScanSuccess(data);
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.header}>
                <Text style={styles.title}>SCAN VESSEL QR CODE</Text>
                <Text style={styles.sub}>Align statutory KIV QR code inside the target reticle</Text>
              </View>

              {/* Real Targeting Reticle Box */}
              <View style={styles.targetReticle}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />
              </View>

              <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
                <Text style={styles.dismissText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F17' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { color: '#F8FAFC', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#0D9488', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  cancelBtn: { marginTop: 14 },
  cancelText: { color: '#94A3B8', fontSize: 12 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 23, 0.45)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  header: { alignItems: 'center' },
  title: { color: '#F8FAFC', fontSize: 15, fontWeight: '800', letterSpacing: 1, fontFamily: 'monospace' },
  sub: { color: '#CBD5E1', fontSize: 11, marginTop: 4 },
  targetReticle: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#0D9488' },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  dismissBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  dismissText: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5 },
});
