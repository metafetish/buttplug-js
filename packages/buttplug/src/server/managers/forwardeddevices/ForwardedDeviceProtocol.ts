/*!
 * Buttplug JS Source Code File - Visit https://buttplug.io for more info about
 * the project. Licensed under the BSD 3-Clause license. See LICENSE file in the
 * project root for full license information.
 *
 * @copyright Copyright (c) Nonpolynomial Labs LLC. All rights reserved.
 */

import * as Messages from "../../../core/Messages";
import { ButtplugMessageException } from "../../../core/Exceptions";
import { ButtplugDeviceProtocol } from "../../../devices/ButtplugDeviceProtocol";
import { IButtplugDeviceImpl } from "../../../devices/IButtplugDeviceImpl";

export class ForwardedDeviceProtocol extends ButtplugDeviceProtocol {

  public constructor(aDeviceImpl: IButtplugDeviceImpl,
                     private _actualDeviceIndex: number,
                     private _messageSpecs: object,
                     private _clientSendClosure: (aMsg: Messages.ButtplugDeviceMessage) => Promise<Messages.ButtplugMessage>) {
    super(`${aDeviceImpl.Name}` , aDeviceImpl);
  }

  public Initialize = async (): Promise<void> => {
    return Promise.resolve();
  }

  public get MessageSpecifications(): object {
    return this._messageSpecs;
  }

  // Override the base protocol ParseMessage, because we'll never actually handle our own messages.
  public ParseMessage = async (aMsg: Messages.ButtplugMessage): Promise<Messages.ButtplugMessage> => {
    if (!(aMsg instanceof Messages.ButtplugDeviceMessage) || !this.MessageSpecifications.hasOwnProperty(aMsg.Type.name)) {
      throw new ButtplugMessageException(`${this._name} cannot handle message of type ${aMsg.Type.name}`, aMsg.Id);
    }
    // Swap out the device index so we send to the correct device on the other end.
    (aMsg as Messages.ButtplugDeviceMessage).DeviceIndex = this._actualDeviceIndex;
    // We can forward this message on to the client to run.
    return await this._clientSendClosure(aMsg as Messages.ButtplugDeviceMessage);
  }
}
