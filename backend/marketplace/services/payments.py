import requests

class PaymentGateway:
    def __init__(self, provider:str):
        self.provider = provider.lower()

    def initiate_payment(self, phone:str, amount:int, tx_ref:str):
        if self.provider == "mpesa":
            return self._mpesa_push(phone, amount, tx_ref)
        elif self.provider == "tigopesa":
            return self._tigo_charge(phone, amount, tx_ref)
        elif self.provider == "airtelmoney":
            return self._airtel_collect(phone, amount, tx_ref)
        raise ValueError("Unknown provider")

    def _mpesa_push(self, phone, amount, tx_ref):
        # TODO: integrate Vodacom M-Pesa API
        payload = {"amount":amount, "msisdn":phone, "reference":tx_ref}
        print("Simulating M-Pesa push:", payload)
        return {"status":"pending","tx_ref":tx_ref}

    def _tigo_charge(self, phone, amount, tx_ref):
        print("Simulating Tigo Pesa:", phone, amount)
        return {"status":"pending","tx_ref":tx_ref}

    def _airtel_collect(self, phone, amount, tx_ref):
        print("Simulating Airtel Money:", phone, amount)
        return {"status":"pending","tx_ref":tx_ref}
